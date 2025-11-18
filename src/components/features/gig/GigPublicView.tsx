'use client';

import React, {useEffect, useMemo, useRef, useState} from "react";
import {ISellerDocument} from "@/types/seller";
import {MapPin, Send, MoveRight, Clock3, Star} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import {notFound, useRouter} from 'next/navigation';
import GigCard from "@/components/features/gig/GigCard";
import {IGigDocument} from "@/types/gig";
import Link from "next/link";
import {formatPrice, fromSlug, toSlug} from "@/lib/utils/helper";
import Breadcrumb from "@/components/shared/Breadcrumb";
import BreadcrumbItem from "@/components/shared/BreadcrumbItem";
import Carousel from "@/components/shared/Carousel";
import Image from "next/image";
import {MultiCardCarousel} from "@/components/shared/MultiCardCarousel";
import {AnimatePresence, motion} from "framer-motion";
import OrderCustomize from "@/components/features/order/OrderCustomize";
import Modal from "@/components/shared/Modal";
import {MultiFileInput} from "@/components/shared/MultiFileInput";
import ContactForm from "@/components/features/chat/ContactForm";
import {ReviewList} from "@/components/features/review/ReviewList";

export default function GigPublicView({
                                          gig,
                                          seller,
                                          sellerGigs,
                                          similarGigs,
                                      }: {
    seller: ISellerDocument | null,
    gig: Required<IGigDocument>,
    sellerGigs: Required<IGigDocument>[],
    similarGigs?: Required<IGigDocument>[],
}) {
    const floatingHeaderRef = useRef<HTMLDivElement>(null);
    const [showContactForm, setShowContactForm] = useState<boolean>(false);
    const [isContinueOpen, setContinueOpen] = useState<boolean>(false);
    const router = useRouter();

    const avgRating = useMemo(() => {
        if (!gig) return 0;

        let totalSum = 0;
        let totalCount = 0;

        totalSum = gig.ratingSum ?? 0;
        totalCount = gig.ratingsCount ?? 0;

        return totalCount > 0 ? totalSum / totalCount : 0;
    }, [gig]);


    // === SCROLL TO SECTION WITH OFFSET ===
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (!element) return;

        const headerOffset = floatingHeaderRef.current?.offsetHeight ?? 120;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    // const handleMoreAboutOpen = () => {
    //     if (isContinueOpen) {
    //         document.body.style.overflow = 'hidden';
    //     } else {
    //         document.body.style.overflow = ''; // Revert to default
    //     }
    // }

    useEffect(() => {
        if (isContinueOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isContinueOpen]);

    if (!seller) {
        notFound();
    }

    function handleContinue() {
        setContinueOpen(true);
    }

    return (
        <>
            <div className="container mx-auto px-6 pt-4 pb-16">

                {/* Breadcrumb */}
                <Breadcrumb className="text-sm mb-4" highlight={false}>
                    <BreadcrumbItem href="/">Home</BreadcrumbItem>
                    <BreadcrumbItem href={`/categories/${toSlug(gig.categories)}`}>
                        {fromSlug(gig.categories)}
                    </BreadcrumbItem>
                </Breadcrumb>

                {/* MAIN LAYOUT */}
                <div className="relative grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-y-8 gap-x-20 mb-16">

                    {/* === LEFT TOP COLUMN: Header + Slider === */}
                    <div className="grid grid-cols-1 gap-8 order-1 lg:order-1">
                        {/* Header */}
                        <section className="flex flex-col gap-4">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-wide">{gig.title}</h1>
                            <div className="flex flex-row justify-center gap-4">
                                <Avatar
                                    src={seller.profilePicture || "/images/default-avatar.png"}
                                    username={seller.fullName ?? ""}
                                    size={60}
                                    className="border-1 border-primary-500"/>
                                <div className="flex flex-col justify-center items-start flex-1 gap-1">
                                    <div className="flex flex-row items-end gap-2">
                                        <Link href={`/${seller.username}`}
                                              className="text-lg font-semibold text-gray-800 hover:underline">
                                            {seller.fullName}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="flex items-center gap-0-5">
                                            {Array.from({length: 5}, (_, i) => {
                                                const filled = Math.min(Math.max(avgRating - i, 0), 1);
                                                return (
                                                    <div key={i} className="relative w-4 h-4">
                                                        <Star
                                                            className="absolute inset-0 w-4 h-4 text-gray-300 fill-gray-300"/>
                                                        <div className="absolute inset-0 overflow-hidden"
                                                             style={{width: `${filled * 100}%`}}>
                                                            <Star className="w-4 h-4 text-gray-800 fill-gray-900"/>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                                            <span className="font-semibold text-gray-500">
                                            (<span onClick={() => scrollToSection('reviews')}
                                                   className="underline cursor-pointer">
                                                {gig.ratingsCount} reviews
                                            </span>)
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Slider */}
                        <section className="scroll-mt-32">
                            <Carousel
                                slides={[{
                                    key: 1,
                                    content: (
                                        <div className="relative w-full aspect-[16/9] rounded-md">
                                            <Image
                                                src={gig.coverImage}
                                                alt={gig.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-300 rounded-md"
                                                onError={(e) => {
                                                    e.currentTarget.src = "/images/logo-brand.webp";
                                                }}/>
                                        </div>
                                    )
                                }]}/>
                        </section>
                    </div>

                    {/* === RIGHT COLUMN: Continue + Contact === */}
                    <aside className="lg:sticky top-8 grid grid-cols-1 h-fit gap-8 order-2 lg:order-1">
                        {/* Continue Card */}
                        <div
                            className="bg-white rounded-md shadow p-6 border border-gray-100 lg:max-w-140 lg:ml-auto">
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between gap-8">
                                    <h2 className="text-lg font-semibold">{gig.basicTitle}</h2>
                                    <p className="text-xl font-bold">{formatPrice(gig.price)}</p>
                                </div>
                                <div className="border-b border-gray-200"></div>
                                <div className="text-base text-gray-700">
                                    <h2>{gig.basicDescription}</h2>
                                </div>
                                <div className="flex items-center gap-1 text-base font-semibold text-gray-900">
                                    <Clock3 className="h-4 w-4" strokeWidth={3}/>
                                    <span>{gig.expectedDeliveryDays} day delivery</span>
                                </div>
                                <button
                                    onClick={handleContinue}
                                    className="btn flex items-center justify-between gap-2 bg-gray-900 hover:bg-gray-800 transition text-white mt-1">
                                    <span/>
                                    <span className="text-lg font-semibold">Continue</span>
                                    <MoveRight className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>

                        {/* Contact Card */}
                        <div
                            className="flex flex-col gap-1 p-6 border border-gray-100 rounded-md shadow w-full lg:max-w-140 lg: lg:ml-auto">
                            <div className="flex gap-3 mb-3">
                                <Avatar
                                    src={seller.profilePicture || "/images/default-avatar.png"}
                                    username={seller.fullName ?? ""}
                                    size={40}
                                    className="border border-primary-500"/>
                                <div className="flex flex-col">
                                    <h1 className="text-base font-bold text-gray-800">{seller.fullName}</h1>
                                    <p className="text-gray-700 text-sm">Offline</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowContactForm(true)}
                                className="btn btn-outlined border-gray-300 hover:bg-gray-50 text-gray-900 flex items-center justify-center gap-2 transition pt-1-5">
                                <span className="text-base font-semibold">Contact me</span>
                                <Send className="w-4 h-4"/>
                            </button>
                            <div className="text-center text-sm text-gray-600 mt-1">
                                <p>Average response time: {seller.responseTime} hour</p>
                            </div>
                        </div>
                    </aside>

                    {/* === LEFT BOTTOM COLUMN: About + Additional Sections === */}
                    <div className="grid grid-cols-1 gap-8 order-3 lg:order-2">
                        {/* About */}
                        <section id="about" className="scroll-mt-32">
                            <h2 className="text-xl font-bold mb-3 text-gray-900">About this gig</h2>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                {gig.description || "No description provided."}
                            </p>
                        </section>

                        <section id="reviews" className="scroll-mt-32">
                            <h2 className="text-xl font-bold mb-3 text-gray-900">Reviews</h2>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-base font-bold text-gray-900 mb-4">{gig.ratingsCount} reviews for
                                    this gig</h3>
                                {/* === Average Rating === */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center">
                                        {Array.from({length: 5}, (_, i) => {
                                            const filled = Math.min(Math.max(avgRating - i, 0), 1);
                                            return (
                                                <div key={i} className="relative w-4 h-4">
                                                    {/* Nền xám */}
                                                    <Star
                                                        className="absolute inset-0 w-4 h-4 text-gray-300 fill-gray-300"/>
                                                    {/* Phần fill vàng */}
                                                    <div
                                                        className="absolute inset-0 overflow-hidden"
                                                        style={{width: `${filled * 100}%`}}
                                                    >
                                                        <Star className="w-4 h-4 text-gray-900 fill-gray-900"/>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <span className="text-base font-bold text-gray-900">
                                    {avgRating.toFixed(1)}
                                </span>
                                </div>
                            </div>
                            {gig.ratingCategories ? (
                                <div className="flex flex-col gap-3">
                                    {/* === Rating Distribution === */}
                                    {Object.entries(gig.ratingCategories)
                                        .sort(([a], [b]) => Number(b) - Number(a)) // sort 5 → 1
                                        .map(([key, item]) => {
                                            const label = key[0].toUpperCase() + key.slice(1); // Five, Four...
                                            const total = gig.ratingsCount || 1;
                                            const percentage = ((item.count / total) * 100).toFixed(1);

                                            return (
                                                <div key={key} className="flex items-center justify-center gap-4">
                                                <span className="w-8 text-sm font-bold text-gray-700">
                                                    {label}
                                                </span>
                                                    <div
                                                        className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-2 bg-gray-900 rounded-full transition-all duration-300"
                                                            style={{width: `${percentage}%`}}/>
                                                    </div>
                                                    <span className="w-8 text-sm font-semibold text-gray-500">
                                                    (<span className="">{item.count}</span>)
                                                </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <p className="text-gray-500 text-sm">No reviews yet.</p>
                                </div>
                            )}
                        </section>

                        {/* Reviews */}
                        <section id="reviews" className="scroll-mt-32">
                            <ReviewList params={{gigId: gig._id, targetId: seller._id}} totalCount={gig.ratingsCount!}/>
                        </section>
                    </div>

                </div>

            </div>
            <div className={"bg-gray-100"}>
                <div className={"container mx-auto px-6 py-16"}>
                    {/* === Seller Gigs === */}
                    {sellerGigs?.length > 0 && (
                        <section id="services" className="scroll-mt-32 mb-16">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="flex gap-2 text-xl font-normal text-gray-800">
                                    <span>More from</span>
                                    <Link href={`/${seller.username}`} className={"underline"}>{seller.username}</Link>
                                </h2>
                            </div>
                            <MultiCardCarousel
                                items={sellerGigs}
                                renderItem={(item) =>
                                    <GigCard {...(item)} />
                                }
                                showExplore={false}
                            />
                        </section>
                    )}

                    {/* === Seller Gigs === */}
                    {similarGigs && similarGigs?.length > 0 && (
                        <section id="services" className="scroll-mt-32 mb-16">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="flex gap-2 text-2xl font-bold text-gray-900">
                                    <span>People Who Viewed This Service Also Viewed</span>
                                </h2>
                            </div>
                            <MultiCardCarousel
                                items={similarGigs}
                                renderItem={(item) =>
                                    <GigCard {...(item)} />
                                }
                                showExplore={true}
                            />
                        </section>
                    )}
                </div>
            </div>

            {/* Contact Seller Modal (Secondary Modal) (giữ nguyên) */}
            <Modal
                isOpen={showContactForm}
                onClose={() => setShowContactForm(false)}
                className="container mx-auto flex bg-white rounded-xl shadow-xl p-1 max-h-[80vh] w-full max-w-md"
                backdropClassName="bg-black/20"
            >
                <ContactForm receiverId={seller._id} username={seller.username!} profilePicture={seller.profilePicture!}
                             isSeller={false}
                             onCancelAction={() => setShowContactForm(false)} onSubmitAction={() => console.log()}/>
            </Modal>

            <AnimatePresence>
                {isContinueOpen && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3, ease: "easeInOut"}}
                        className="fixed inset-0 bg-black/20 z-50"
                        onClick={() => setContinueOpen(false)}
                    >
                        <motion.div
                            initial={{x: "100%"}}
                            animate={{x: 0}}
                            exit={{x: "100%"}}
                            transition={{duration: 0.3, ease: "easeInOut"}}
                            className="fixed top-0 right-0 h-full w-full max-w-140 bg-white shadow-xl z-60"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-full h-full overflow-y-auto scrollbar-beautiful">
                                <OrderCustomize gig={gig} onContinue={() => setContinueOpen(false)}/>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}