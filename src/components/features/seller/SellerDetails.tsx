'use client';

import {X, MapPin, Languages, Star, Send, User2} from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import {ISellerDocument} from "@/types/seller";
import Link from "next/link";
import {fromSlug} from "@/lib/utils/helper";
import {getCountryData, TCountryCode} from "countries-list";

interface SellerDetailsProps {
    seller: ISellerDocument;
    onContact: () => void;
}

export default function SellerDetails({seller, onContact}: SellerDetailsProps) {
    const formatDate = (date: string | Date | undefined) => {
        if (!date) return "Present";
        const d = new Date(date);
        return isNaN(d.getTime()) ? "Present" : d.getFullYear().toString();
    };

    const joinedDate = seller.createdAt
        ? new Date(seller.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : null;

    return (
        <div
            className="container mx-auto p-6 w-full flex flex-col bg-background overflow-hidden gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2">
                <section className="flex flex-col sm:flex-row gap-6">
                    <Avatar
                        src={seller.profilePicture || "/images/default-avatar.png"}
                        username={seller.fullName ?? ""}
                        size={160}
                        className="border-2 border-primary-500"
                    />
                    <div className="flex flex-col justify-center items-start flex-1 gap-2">
                        <div className="flex flex-row items-end gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{seller.fullName}</h1>
                            <p className="text-lg text-gray-500">@{seller.username}</p>
                        </div>

                        <div className="flex items-center gap-1 text-base">
                            <Star className="w-4 h-4 fill-gray-900 text-gray-900"/>
                            <span
                                className="font-bold text-gray-900">{((seller.ratingSum || 0) / (seller.ratingsCount || 1)).toFixed(1)}</span>
                            <span className="font-semibold text-gray-500">
                                  (<span className="">{seller.ratingsCount} reviews</span>)
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

                {/*<div className="justify-self-end">*/}
                {/*    <button*/}
                {/*        onClick={() => {*/}
                {/*            onContact?.()*/}
                {/*        }}*/}
                {/*        className="btn bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 text-lg">*/}
                {/*        <Send className="w-4 h-4"/> Contact me*/}
                {/*    </button>*/}
                {/*</div>*/}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[6fr_4fr] gap-10">
                <div className={"flex flex-col gap-6"}>
                    {/* About */}
                    <section id="about" className="scroll-mt-32">
                        <h2 className="text-lg font-semibold mb-2 text-gray-900">About me</h2>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {seller.description || "No description provided."}
                        </p>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-lg font-semibold mb-2 text-gray-900">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {seller.skills?.length ? (
                                <>
                                    {seller.skills.map((skill, idx) => (
                                        <button
                                            key={idx}
                                            className="btn btn-outlined px-3 py-1 rounded-full text-sm text-gray-800 border-gray-300"
                                        >
                                            {fromSlug(skill)}
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <span className="text-gray-400 text-sm">No skills listed</span>
                            )}
                        </div>
                    </section>

                    {/* Education */}
                    {seller.education && seller.education.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-3 text-gray-900">Education</h2>
                            <div className="space-y-4">
                                {seller.education.map((edu) => (
                                    <div key={edu._id} className="border-l-4 border-primary-500 pl-3 text-sm ">
                                        <p className="font-semibold text-gray-900">{edu.university}</p>
                                        {edu.major && <p className="text-sm text-gray-600">{edu.major}</p>}
                                        <p className="text-gray-500">
                                            {edu.country} • Graduated {edu.year}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {seller.certificates && seller.certificates.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-3 text-gray-900">Certifications</h2>
                            <div className="space-y-3">
                                {seller.certificates.map((cert) => (
                                    <div key={cert._id}
                                         className="border-l-4 border-amber-500 pl-3">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-800">{cert.name}</h5>
                                            <p className="text-sm text-gray-600">{cert.from}</p>
                                        </div>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {cert.year}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {seller.experience && seller.experience.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-3 text-gray-900">Experience</h2>
                            <div className="space-y-4">
                                {seller.experience.map((exp) => (
                                    <div key={exp._id} className="border-l-4 border-gray-300 pl-4">
                                        <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                                        <p className="text-sm text-gray-700">{exp.company}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                                            {exp.currentlyWorkingHere && " (Current)"}
                                        </p>
                                        {exp.description && (
                                            <p className="text-sm text-gray-600">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                </div>
                <div>
                    {/* Languages */}
                    <div className="flex-col flex gap-6 border border-gray-200 shadow-sm p-6 rounded-md">
                        <div className="flex text-base font-semibold items-center gap-2 text-gray-900">
                            <User2 className="w-5 h-5 "/>
                            <span>On JobLance since {joinedDate}</span>
                        </div>
                        <div className="border-b border-gray-300"/>
                        <div className="flex flex-col gap-4 text-base">
                            <h2 className={"font-semibold"}>I speak</h2>
                            {seller.languages.map((lang, idx) => (
                                <div key={idx} className="grid grid-cols-2 gap-6">
                                    <span className="text-gray-900">{lang.language}</span>
                                    <span className="text-gray-500 capitalize">{lang.level}</span>
                                </div>
                            ))}
                        </div>
                        {/* Social Links */}
                        {seller.socialLinks && seller.socialLinks.length > 0 && (
                            <div className="flex flex-col gap-4 text-base">
                                <h2 className="font-semibold text-gray-900">Connect</h2>
                                <div className="flex gap-3">
                                    {seller.socialLinks.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:underline text-sm"
                                        >
                                            {link.replace(/^https?:\/\//, "").split("/")[0]}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    );
}