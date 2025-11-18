'use client';

import React, {useEffect, useMemo, useRef, useState} from "react";
import {ISellerDocument} from "@/types/seller";
import {MapPin, Send, Languages, Info, Star} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import ReactPortal from "@/components/shared/ReactPortal";
import {notFound} from 'next/navigation';
import GigCard from "@/components/features/gig/GigCard";
import {IGigDocument} from "@/types/gig";
import {AnimatePresence, motion} from "framer-motion";
import SellerDetails from "@/components/features/seller/SellerDetails";
import {fromSlug} from "@/lib/utils/helper";
import {getCountryData, TCountryCode} from "countries-list";
import Modal from "@/components/shared/Modal";
import ContactForm from "@/components/features/chat/ContactForm";
import {useUserContext} from "@/context/UserContext";
import {useStatusContext} from "@/context/StatusContext";
import {ReviewList} from "@/components/features/review/ReviewList";

export default function SellerPublicProfile({
                                                seller,
                                                gigs,
                                            }: {
    seller: ISellerDocument | null,
    gigs: Required<IGigDocument>[],
}) {
    const sentinelRef = useRef<HTMLDivElement>(null);
    const floatingHeaderRef = useRef<HTMLDivElement>(null);
    const [showFloatingHeader, setShowFloatingHeader] = useState(false);
    const [maxGigsShown, setMaxGigsShown] = useState(4);
    const [maxSkillsShown, setMaxSkillsShown] = useState(5);
    const [activeSection, setActiveSection] = useState<string>("about");
    const [isMoreAboutOpen, setMoreAboutOpen] = useState<boolean>(false);
    const [showContactForm, setShowContactForm] = useState<boolean>(false);

    const {online, requestStatus} = useStatusContext()

    const {user} = useUserContext();

    const sections = useMemo(() => (['about', 'services', 'reviews']), []);
    const avgRating = useMemo(() => {
        if (!gigs?.length) return 0;

        let totalSum = 0;
        let totalCount = 0;

        for (const gig of gigs) {
            totalSum += gig.ratingSum ?? 0;
            totalCount += gig.ratingsCount ?? 0;
        }

        return totalCount > 0 ? totalSum / totalCount : 0;
    }, [gigs]);
    const isOnline = useMemo(() => Boolean(online.get(seller?._id ?? '')), [online, seller?._id]);


    // === SCROLL TO SECTION WITH OFFSET ===
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        setActiveSection(id);
        if (!element) return;

        const headerOffset = floatingHeaderRef.current?.offsetHeight ?? 120;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        requestStatus(seller?._id)
    }, []);

    useEffect(() => {
        if (isMoreAboutOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMoreAboutOpen]);

    // === INTERSECTION OBSERVER FOR FLOATING HEADER ===
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowFloatingHeader(!entry.isIntersecting);
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []);

    // === INTERSECTION OBSERVER FOR SECTION HIGHLIGHT ===
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visibleSections.length > 0) {
                    setActiveSection(visibleSections[0].target.id);
                }
            },
            {
                root: null,
                rootMargin: '-100px 0px -60% 0px',
                threshold: [0, 0.25, 0.5, 0.75, 1],
            }
        );

        sections.forEach((sectionId) => {
            const element = document.getElementById(sectionId);
            if (element) observer.observe(element);
        });

        return () => {
            sections.forEach((sectionId) => {
                const element = document.getElementById(sectionId);
                if (element) observer.unobserve(element);
            });
        };
    }, [sections]);


    if (!seller) {
        notFound();
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div ref={sentinelRef} className="h-px"/>

            {/* === MAIN LAYOUT === */}
            <div className="grid grid-cols-[2fr_1fr] gap-8 mb-16">
                {/* === LEFT COLUMN === */}
                <div className="flex flex-col gap-8">
                    {/* Header */}
                    <section className="flex items-start gap-6">
                        <Avatar
                            src={seller.profilePicture || "/images/default-avatar.png"}
                            username={seller.fullName ?? ""}
                            size={148}
                            isOnline={isOnline}
                            className="border-2 border-primary-500"
                        />
                        <div className="flex flex-col justify-center items-start flex-1 gap-2">
                            <div className="flex flex-row items-end gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{seller.fullName}</h1>
                                <p className="text-lg text-gray-500">@{seller.username}</p>
                            </div>

                            <div className="flex items-center gap-1 text-base">
                                <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                                <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                                <span className="font-semibold text-gray-500">
                                    (<span onClick={() => scrollToSection('reviews')}
                                           className="underline cursor-pointer">{seller.ratingsCount}</span>)
                                </span>
                            </div>

                            {seller.oneliner && (
                                <p className="text-gray-900 text-base">{seller.oneliner}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-base text-gray-900">
                                {seller.country && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4 text-gray-900"/>
                                        <span>{getCountryData(seller.country as TCountryCode).name}</span>
                                    </span>
                                )}
                                {seller.languages.length > 0 && (
                                    <span className="flex items-center gap-1">
                                <Languages className="w-4 h-4 text-gray-900"/>
                                <span>{seller.languages.map(lang => lang.language).join(", ")}</span>
                              </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* About */}
                    <section id="about" className="scroll-mt-32">
                        <h2 className="text-lg font-semibold mb-3 text-gray-900">About me</h2>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {seller.description || "No description provided."}
                        </p>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-lg font-semibold mb-3 text-gray-900">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {seller.skills?.length ? (
                                <>
                                    {seller.skills.slice(0, maxSkillsShown).map((skill, idx) => (
                                        <button
                                            key={idx}
                                            className="btn btn-outlined px-3 py-1 rounded-full text-sm text-gray-800 border-gray-300"
                                        >
                                            {fromSlug(skill)}
                                        </button>
                                    ))}
                                    {maxSkillsShown < seller.skills.length && (
                                        <button
                                            onClick={() => setMaxSkillsShown(prev => Math.max(prev + 5, seller.skills.length))}
                                            className="btn btn-text text-base text-gray-900 underline font-semibold"
                                        >
                                            +{Math.max(5, seller.skills.length - maxSkillsShown)}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <span className="text-gray-400 text-sm">No skills listed</span>
                            )}
                        </div>
                    </section>
                </div>

                {/* === RIGHT COLUMN === */}
                <aside className="hidden lg:flex mt-8 flex-col gap-4">
                    <div className="w-full flex justify-end">
                        <button
                            onClick={() => setMoreAboutOpen(true)}
                            className="btn btn-outlined text-gray-900 text-base border-gray-200 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                            <Info className="w-4 h-4"/> More About Me
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                        <div className="flex flex-col gap-2 mt-6">
                            <div className="flex gap-4 mb-3">
                                <Avatar
                                    src={seller.profilePicture || "/images/default-avatar.png"}
                                    username={seller.fullName ?? ""}
                                    isOnline={isOnline}
                                    size={52}
                                    className="border border-primary-500"
                                />
                                <div className="flex flex-col gap-1">
                                    <h1 className="text-lg font-bold text-gray-800">{seller.fullName}</h1>
                                    {/*<h1 className="text-sm text-gray-700">{seller.username}</h1>*/}
                                    <p className="text-gray-700 text-base">{isOnline ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>
                            {user?.id !== seller._id && (
                                <button
                                    onClick={() => setShowContactForm(true)}
                                    className="btn btn-soft gap-2 bg-primary-600 hover:bg-primary-700 transition text-white">
                                    <Send size={18}/> <span className="text-lg font-semibold">Contact me</span>
                                </button>
                            )}

                            {/*<div className="text-center text-sm text-gray-600 mt-2">*/}
                            {/*    <p>Average response time: {seller.responseTime} hour</p>*/}
                            {/*</div>*/}
                        </div>
                    </div>
                </aside>
            </div>

            {/* === Featured Gigs === */}
            {gigs?.length > 0 && (
                <section id="services" className="scroll-mt-32 mb-16">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">My Gigs</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {gigs.slice(0, maxGigsShown).map((gig) => (
                            <GigCard key={gig._id} {...gig} />
                        ))}
                    </div>

                    {maxGigsShown < gigs.length && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setMaxGigsShown(prev => Math.min(prev + 4, gigs.length))}
                                className="btn btn-text text-base text-gray-900 underline font-semibold"
                            >
                                +{Math.min(4, gigs.length - maxGigsShown)} more
                            </button>
                        </div>
                    )}
                </section>
            )}

            <section id="reviews" className="scroll-mt-32 max-w-md mb-20">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-base font-bold text-gray-900 mb-4">{seller.ratingsCount} Reviews</h2>
                    {/* === Average Rating === */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                            {Array.from({length: 5}, (_, i) => {
                                const filled = Math.min(Math.max(avgRating - i, 0), 1);
                                return (
                                    <div key={i} className="relative w-4 h-4">
                                        {/* Nền xám */}
                                        <Star className="absolute inset-0 w-4 h-4 text-gray-300 fill-gray-300"/>
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
                {seller.ratingCategories ? (
                    <div className="flex flex-col gap-3">
                        {/* === Rating Distribution === */}
                        {Object.entries(seller.ratingCategories)
                            .sort(([a], [b]) => Number(b) - Number(a)) // sort 5 → 1
                            .map(([key, item]) => {
                                const label = key[0].toUpperCase() + key.slice(1); // Five, Four...
                                const total = seller.ratingsCount || 1;
                                const percentage = ((item.count / total) * 100).toFixed(1);

                                return (
                                    <div key={key} className="flex items-center justify-center gap-4">
                                              <span className="w-8 text-sm font-bold text-gray-700">
                                                {label}
                                              </span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-2 bg-gray-900 rounded-full transition-all duration-300"
                                                style={{width: `${percentage}%`}}
                                            />
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


            {/* === REVIEWS === */}
            <section id="reviews" className="scroll-mt-32">
                <ReviewList params={{targetId: seller._id}} totalCount={seller.ratingsCount!}/>
            </section>

            {/* === FLOATING HEADER === */}
            {showFloatingHeader && (
                <ReactPortal>
                    <div
                        ref={floatingHeaderRef}
                        className="fixed top-0 left-0 right-0 z-20 bg-background backdrop-blur-md border-b border-gray-200 shadow-sm"
                    >
                        <div className="container mx-auto px-6 pt-3 flex flex-col">
                            {/* Top Row */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar
                                        src={seller.profilePicture || "/images/default-avatar.png"}
                                        username={seller.fullName ?? ""}
                                        isOnline={isOnline}
                                        size={52}
                                        className="border-2 border-primary-500"
                                    />
                                    <div className="flex flex-col gap-1">
                                        <p className="text-lg font-bold text-gray-900">{seller.fullName}</p>
                                        <div className="flex items-center gap-1 text-base">
                                            <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                                            <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
                                            <span className="font-semibold text-gray-500">
                                              (<span className="underline cursor-pointer">{seller.ratingsCount}</span>)
                                            </span>
                                        </div>
                                        <p className="text-base text-gray-500 hidden sm:block">
                                            {isOnline ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end justify-center gap-3 mt-2">
                                    {user?.id !== seller._id && (
                                        <button
                                            onClick={() => setShowContactForm(true)}
                                            className="btn btn-soft gap-2 bg-primary-600 hover:bg-primary-700 transition text-white">
                                            <Send size={18}/> <span className="text-lg font-semibold">Contact me</span>
                                        </button>
                                    )}
                                    <p className="text-sm text-gray-500 hidden sm:block">
                                        Average response time: {seller.responseTime}h
                                    </p>
                                </div>
                            </div>

                            {/* Navigation với hiệu ứng active */}
                            <nav>
                                <ul className="flex items-center font-medium">
                                    {sections.map((section) => {
                                        const labels: Record<string, string> = {
                                            about: "About Me",
                                            services: "Services",
                                            reviews: "Reviews"
                                        };
                                        return (
                                            <li key={section}>
                                                <button
                                                    onClick={() => scrollToSection(section)}
                                                    className={`btn btn-text rounded-none px-4 py-2 text-base transition-all duration-200 
                                                        ${activeSection === section
                                                        ? 'text-primary-600 font-bold border-b-2 border-primary-600'
                                                        : 'text-gray-600 hover:text-primary-600'
                                                    }`}
                                                >
                                                    {labels[section]}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                        </div>
                    </div>
                </ReactPortal>
            )}

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
                {isMoreAboutOpen ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.3, ease: "easeInOut"}}
                        className="fixed inset-0 bg-black/20 z-50"
                        onClick={() => setMoreAboutOpen(false)}
                    >
                        <motion.div
                            initial={{y: "100%"}}
                            animate={{y: 0}}
                            exit={{y: "100%"}}
                            transition={{duration: 0.3, ease: "easeInOut"}}
                            className="fixed bottom-0 left-0 w-full max-w-full rounded-t-xl bg-white shadow-xl z-60 p-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="max-h-[90vh] overflow-y-auto scrollbar-beautiful">
                                <SellerDetails seller={seller} onContact={() => {
                                }}/>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : undefined}
            </AnimatePresence>
        </div>
    );
}