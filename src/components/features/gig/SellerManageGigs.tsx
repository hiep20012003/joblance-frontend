'use client';

import {useEffect, useRef, useState} from "react";
import SkeletonWrapper from "@/components/shared/SkeletonWrapper";
import {PlusCircle, Star} from "lucide-react";
import {motion, AnimatePresence} from "framer-motion";
import SellerGigCard from "@/components/features/gig/SellerGigCard";
import Pagination from "@/components/shared/Pagination";
import {IGigDocument} from "@/types/gig";
import SellerGigDetail from "@/components/features/gig/SellerGigDetail";
import Modal from "@/components/shared/Modal";
import GigForm, {GigFormHandles} from "@/components/features/gig/GigForm";
import {useFetchMutation} from "@/lib/hooks/useFetchMutation";
import {
    activeGig,
    createGig,
    deleteGig,
    inactiveGig,
    updateGig,
} from "@/lib/services/client/gig.client";
import DropdownInput from "@/components/shared/DropdownInput";
import LoadingWrapper from "@/components/shared/LoadingWrapper";
import {useRouter} from "next/navigation";

const gigStatusOptions = [
    {label: "Active Gigs", value: "active"},
    {label: "Inactive Gigs", value: "inactive"},
];

interface SellerManageGigsProps {
    data: Required<IGigDocument>[];
}

export default function SellerManageGigs({data}: SellerManageGigsProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedGig, setSelectedGig] = useState<IGigDocument | null>(null);
    const [editSelectedGig, setEditSelectedGig] = useState<IGigDocument | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [gigStatus, setGigStatus] = useState(gigStatusOptions[0]);
    const router = useRouter();

    const pageSize = 6;
    const siblingCount = 1;
    const formRef = useRef<GigFormHandles>(null);

    const [gigs, setGigs] = useState<Required<IGigDocument>[]>(data);

    useEffect(() => {
        setGigs(data);
    }, [data]);

    useEffect(() => {
        if (isCreateModalOpen || isEditModalOpen || selectedGig) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isCreateModalOpen, isEditModalOpen, selectedGig]);

    // ==================== MUTATIONS ====================

    const {mutate: createGigMutate, loading: isCreating} = useFetchMutation(
        createGig,
        {
            successMessage: "Gig created successfully",
            onSuccess: (result) => {
                const gig = result as Required<IGigDocument>;
                if (!gig) return;

                setGigs((prev) => {
                    const shouldAdd =
                        (gigStatus.value === "active" && gig.active) ||
                        (gigStatus.value === "inactive" && !gig.active);
                    return shouldAdd ? [...prev, gig] : prev;
                });
                setIsCreateModalOpen(false);
            },
        }
    );

    const {mutate: updateGigMutate, loading: isUpdating} = useFetchMutation(
        async ({id, formData}: { id: string; formData: FormData }) =>
            updateGig(id, formData),
        {
            successMessage: "Gig updated updated successfully",
            onSuccess: (result) => {
                const gig = result as Required<IGigDocument>;
                setGigs((prev) => prev.map((g) => (g._id === gig._id ? gig : g)));
                setIsEditModalOpen(false);
                setEditSelectedGig(null);
            },
        }
    );

    const {mutate: deleteGigMutate, loading: isDeleting} = useFetchMutation(
        deleteGig,
        {
            successMessage: "Gig deleted successfully",
            onSuccess: () => {
                router.refresh();
            },
        }
    );

    const {mutate: activeGigMutate, loading: isActivating} = useFetchMutation(
        activeGig,
        {
            successMessage: "Gig activated successfully",
            onSuccess: (result) => {
                const gig = result as Required<IGigDocument>;
                const newGigs = gigs.map((g) => {
                    return g._id === gig._id ? gig : g
                });
                setGigs(gigs.map((g) => g._id !== gig._id ? g : gig));
            },
        }
    );

    const {mutate: inactiveGigMutate, loading: isInactivating} =
        useFetchMutation(inactiveGig, {
            successMessage: "Gig deactivated successfully",
            redirectOnUnauthorized: true,
            onSuccess: (result) => {
                const gig = result as Required<IGigDocument>;
                setGigs(gigs.map((g) => g._id !== gig._id ? g : gig));
            },
        });

    // ==================== FILTER & PAGINATION ====================

    const filteredGigs = gigs.filter((gig) =>
        gigStatus.value === "active" ? gig.active : !gig.active
    );

    const isMutating =
        isCreating || isUpdating || isDeleting || isActivating || isInactivating;

    const totalCount = filteredGigs.length;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const gigsToShow = filteredGigs.slice(startIndex, endIndex);

    // ==================== HANDLERS ====================

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({top: 0, behavior: "smooth"});
    };

    const handleSelectedView = (option: typeof gigStatusOptions[0]) => {
        setGigStatus(option);
        setCurrentPage(1);
    };

    const handleStatusChange = async (id: string, currentStatus: boolean) => {
        if (currentStatus) {
            await inactiveGigMutate(id);
        } else {
            await activeGigMutate(id);
        }
    };

    const handleDelete = async (id: string) => {
        await deleteGigMutate(id);
    };

    const handleCreateGig = async (formData: FormData) => {

        await createGigMutate(formData);
    };

    const handleUpdateGig = async (formData: FormData) => {
        if (!editSelectedGig) return;
        await updateGigMutate({id: editSelectedGig?._id ?? '', formData});
    };

    // ==================== RENDER ====================

    return (
        <LoadingWrapper isLoading={isMutating} fullScreen zIndex={9999} className={'h-full flex-1'}>
            <div className="flex-1 container mx-auto flex flex-col bg-background p-6 h-full">
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary-600"/>
                            My Gigs
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-36">
                                <DropdownInput
                                    options={gigStatusOptions}
                                    value={gigStatus}
                                    onChange={handleSelectedView}
                                    placeholder="Select status"
                                    className="py-1.5!"
                                />
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="btn gap-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                                <PlusCircle className="w-4 h-4"/>
                                Create New Gig
                            </button>
                        </div>
                    </div>

                    {/* Gig List */}
                    <SkeletonWrapper loading={false}>
                        {gigsToShow.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {gigsToShow.map((gig) => (
                                    <SellerGigCard
                                        key={gig._id}
                                        gig={gig}
                                        onDelete={handleDelete}
                                        onClick={() => setSelectedGig(gig)}
                                        onToggleStatus={handleStatusChange}
                                        onEdit={() => {
                                            setEditSelectedGig(gig);
                                            setIsEditModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                className="flex-1 flex flex-col justify-center items-center text-center py-10 text-gray-500">
                                <p>
                                    You haven&#39;t created any {gigStatus.value} gigs yet.
                                </p>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                                >
                                    <PlusCircle className="-ml-1 mr-2 h-5 w-5"/>
                                    Create Your First Gig
                                </button>
                            </div>
                        )}
                    </SkeletonWrapper>

                    {/* Pagination */}
                    {totalCount > pageSize && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalCount={totalCount}
                                pageSize={pageSize}
                                siblingCount={siblingCount}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </section>

                {/* ==================== CREATE MODAL ==================== */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        formRef.current?.resetForm();
                    }}
                    className="container mx-auto flex bg-white rounded-xl shadow-xl p-1 max-h-[90vh]"
                    backdropClassName="bg-black/20"
                >
                    <div className="flex-1 overflow-y-auto scrollbar-beautiful p-6">
                        <div className="border-b border-gray-300 pb-3 mb-4">
                            <div className="flex items-center gap-3">
                                <PlusCircle className="w-6 h-6 text-primary-600"/>
                                <h2 className="text-xl font-semibold">Create a New Gig</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Showcase your skills by creating a new gig. Fill in the details below to publish your
                                service and start attracting clients.
                            </p>
                        </div>

                        <GigForm
                            ref={formRef}
                            onSubmit={handleCreateGig}
                            onCancel={() => setIsCreateModalOpen(false)}
                            type="create"
                        />

                        <p className="text-xs text-gray-400 mt-4 text-center">
                            Tips: Use high-quality images and clear descriptions to improve your visibility.
                        </p>
                    </div>
                </Modal>

                {/* ==================== EDIT MODAL ==================== */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditSelectedGig(null);
                        formRef.current?.resetForm();
                    }}
                    className="container mx-auto bg-white rounded-xl shadow-xl p-1 max-h-[90vh] flex"
                    backdropClassName="bg-black/20"
                >
                    <div className="flex-1 overflow-y-auto scrollbar-beautiful p-6">
                        {/* Header */}
                        <div className="border-b border-gray-300 pb-3 mb-4">
                            <div className="flex items-center gap-3">
                                <Star className="w-6 h-6 text-primary-600"/>
                                <h2 className="text-xl font-semibold">Edit Your Gig</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Update your gig details to keep them relevant and appealing. Make sure your information
                                accurately reflects your services.
                            </p>
                        </div>
                        <GigForm
                            ref={formRef}
                            initialData={editSelectedGig}
                            onSubmit={handleUpdateGig}
                            onCancel={() => setIsEditModalOpen(false)}
                            type="update"
                        />

                        <p className="text-xs text-gray-400 mt-4 text-center">
                            Note: Changes will take effect immediately after saving.
                        </p>
                    </div>
                </Modal>
            </div>

            {/* ==================== VIEW DETAIL BOTTOM SHEET ==================== */}
            <AnimatePresence>
                {selectedGig && !isEditModalOpen && !isCreateModalOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3, ease: "easeInOut"}}
                        className="fixed inset-0 bg-black/20 z-50"
                        onClick={() => setSelectedGig(null)}
                    >
                        <motion.div
                            initial={{y: "100%"}}
                            animate={{y: 0}}
                            exit={{y: "100%"}}
                            transition={{duration: 0.3, ease: "easeInOut"}}
                            className="fixed bottom-0 left-0 w-full max-w-full rounded-t-xl bg-white shadow-xl z-60 p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="max-h-[80vh] overflow-y-auto scrollbar-beautiful">
                                <SellerGigDetail gig={selectedGig}/>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </LoadingWrapper>
    );
}