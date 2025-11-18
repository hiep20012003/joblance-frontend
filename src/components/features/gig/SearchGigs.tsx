'use client';

import React, {useRef, useState, useCallback, useEffect, useMemo} from "react";
import GigCard, {GigSkeleton} from "@/components/features/gig/GigCard";
import Pagination from "@/components/shared/Pagination";
import {IGigDocument} from "@/types/gig";
import MenuDropdown from "@/components/shared/MenuDropdown";
import {GIG_CATEGORIES} from "@/lib/constants/constant";
import {fromSlug, toSlug} from "@/lib/utils/helper";
import {Check, DollarSign} from 'lucide-react';
import Input from "@/components/shared/Input";
import FormLabel from "@/components/shared/FormLabel";
import DropdownInput from "@/components/shared/DropdownInput";

import {useSearchGigs} from "@/lib/hooks/useSearchGigs";

interface GigsListLayoutProps {
    type?: string;
    category?: string;
    subCategory?: string;
    initialData: {
        hits: Required<IGigDocument>[];
        total: number;
    };
}

export default function SearchGigs({
                                       initialData,
                                       type,
                                       category,
                                       subCategory,
                                   }: GigsListLayoutProps) {
    const {
        gigs,
        pageSize,
        currentPage,
        total,
        loading,
        parsedFilters,
        updateURL,
    } = useSearchGigs({initialData, category, subCategory});

    const categories = ["All Categories", ...GIG_CATEGORIES.map(g => g.category)];

    const budgets = [
        {title: 'Value', description: 'Under $255', value: {min: 0, max: 255}},
        {title: 'Mid-range', description: '$255 - $1600', value: {min: 255, max: 1600}},
        {title: 'High-end', description: '$1600 & Above', value: {min: 1600, max: undefined}},
    ];

    const deliveries = [
        {title: 'Express 24H', value: 1},
        {title: 'Up to 3 days', value: 3},
        {title: 'Up to 7 days', value: 7},
        {title: 'Anytime', value: undefined},
    ];

    const sortOptions = useMemo(() => type !== 'categories' ? [
        {label: 'Best Selling', value: {by: 'best', order: 'desc'}},
        {label: 'Best match', value: {by: '_score', order: 'desc'}},
        {label: 'Price: Low to High', value: {by: 'price', order: 'asc'}},
        {label: 'Price: High to Low', value: {by: 'price', order: 'desc'}},
        {label: 'Newest', value: {by: 'createdAt', order: 'desc'}},
    ] : [
        {label: 'Best Selling', value: {by: 'best', order: 'desc'}},
        {label: 'Price: Low to High', value: {by: 'price', order: 'asc'}},
        {label: 'Price: High to Low', value: {by: 'price', order: 'desc'}},
        {label: 'Newest', value: {by: 'createdAt', order: 'desc'}},
    ], [])

    // === States ===
    const [selectedCategory, setSelectedCategory] = useState<string>(
        fromSlug(parsedFilters.categories[0] || "")
    );

    const [tempBudget, setTempBudget] = useState<{
        type: 'preset' | 'custom';
        min: number | undefined;
        max: number | undefined;
    }>({
        type: parsedFilters.priceMin > 0 || parsedFilters.priceMax < 100000 ? 'custom' : 'preset',
        min: parsedFilters.priceMin || undefined,
        max: parsedFilters.priceMax < 100000 ? parsedFilters.priceMax : undefined,
    });

    const [appliedBudget, setAppliedBudget] = useState({
        min: parsedFilters.priceMin || 0,
        max: parsedFilters.priceMax || 100000,
    });

    const [tempDelivery, setTempDelivery] = useState<number | undefined>(
        parsedFilters.expectedDeliveryDays < 365 ? parsedFilters.expectedDeliveryDays : undefined
    );

    // Thêm appliedDelivery để dùng trong onClose
    const [appliedDelivery, setAppliedDelivery] = useState<number | undefined>(
        parsedFilters.expectedDeliveryDays < 365 ? parsedFilters.expectedDeliveryDays : undefined
    );

    const [selectedSort, setSelectedSort] = useState(sortOptions.find(o =>
        o.value.by === parsedFilters.sort.by && o.value.order === parsedFilters.sort.order
    ) || sortOptions[0]);

    const [openMenu, setOpenMenu] = useState({
        category: false,
        budget: false,
        delivery: false,
    });

    // === Handlers ===
    const handleCategorySelect = useCallback((category: string) => {
        const newCategory = category === "All Categories" ? "" : (selectedCategory === category ? "" : category);

        setSelectedCategory(newCategory);

        updateURL({
            cat: newCategory ? toSlug(newCategory) : undefined,
        });

        setOpenMenu(p => ({...p, category: false}));
    }, [selectedCategory, updateURL]);


    const handleTempBudgetChange = (type: 'preset' | 'custom', min?: number, max?: number) => {
        if (type === 'preset') {
            setTempBudget({type: 'preset', min, max});
        } else {
            setTempBudget(prev => ({...prev, type: 'custom'}));
        }
    };

    const handleCustomMinChange = (value: string) => {
        setTempBudget(prev => ({...prev, min: parseInt(value) || 0}));
    };

    const handleCustomMaxChange = (value: string) => {
        setTempBudget(prev => ({...prev, max: parseInt(value) || undefined}));
    };

    const applyBudget = useCallback(() => {
        const min = tempBudget.min ?? 0;
        const max = tempBudget.max ?? 100000;
        setAppliedBudget({min, max});
        updateURL({
            min: min > 0 ? min.toString() : undefined,
            max: max < 100000 ? max.toString() : undefined,
        });
        setOpenMenu(p => ({...p, budget: false}));
    }, [tempBudget, updateURL]);

    const clearBudget = useCallback(() => {
        setTempBudget({type: 'preset', min: undefined, max: undefined});
        setAppliedBudget({min: 0, max: 100000});
        updateURL({min: undefined, max: undefined});
        setOpenMenu(p => ({...p, budget: false}));
    }, [updateURL]);

    const handleTempDeliveryChange = (value?: number) => {
        setTempDelivery(value);
    };

    const applyDelivery = useCallback(() => {
        setAppliedDelivery(tempDelivery);
        updateURL({
            days: tempDelivery && tempDelivery < 365 ? tempDelivery.toString() : undefined,
        });
        setOpenMenu(p => ({...p, delivery: false}));
    }, [tempDelivery, updateURL]);

    const clearDelivery = useCallback(() => {
        setTempDelivery(undefined);
        setAppliedDelivery(undefined);
        updateURL({days: undefined});
        setOpenMenu(p => ({...p, delivery: false}));
    }, [updateURL]);

    const handleSortChange = useCallback((value: string) => {
        const option = JSON.parse(value);
        const selected = sortOptions.find(o => o.value.by === option.by && o.value.order === option.order)!;
        setSelectedSort(selected);
        updateURL({
            sort: selected.value.by === '_score' ? undefined : selected.value.by,
            order: selected.value.order,
        });
    }, [updateURL, sortOptions]);

    // Pagination
    const handlePageChange = useCallback((newPage: number) => {
        updateURL({page: newPage > 1 ? newPage.toString() : undefined});

        // containerRef.current?.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, [updateURL]);

    // Refs
    const categoryBtnRef = useRef<HTMLButtonElement>(null);
    const budgetBtnRef = useRef<HTMLButtonElement>(null);
    const deliveryBtnRef = useRef<HTMLButtonElement>(null);
    const filterBarRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [showShadow, setShowShadow] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (filterBarRef.current) {
                const {top} = filterBarRef.current.getBoundingClientRect();
                setShowShadow(top <= 0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
    }, [currentPage]);


    return (
        <div ref={containerRef} className="w-full relative flex flex-col">
            {/* Filter bar */}
            <div
                ref={filterBarRef}
                className={`w-full py-4 bg-background transition-shadow duration-200 ${
                    showShadow ? 'shadow-sm sticky top-0 z-10' : ''
                }`}
            >
                <div className="container px-6 mx-auto flex items-center gap-3 flex-wrap">
                    {type !== 'categories' && (
                        <button ref={categoryBtnRef}
                                onClick={() => setOpenMenu(p => ({...p, category: !p.category}))}
                                className="btn btn-outlined px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:bg-background">
                            {selectedCategory || "Category"}
                        </button>
                    )}

                    <button ref={budgetBtnRef}
                            onClick={() => setOpenMenu(p => ({...p, budget: !p.budget}))}
                            className="btn btn-outlined px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:bg-background">
                        Budget
                    </button>

                    <button ref={deliveryBtnRef}
                            onClick={() => setOpenMenu(p => ({...p, delivery: !p.delivery}))}
                            className="btn btn-outlined px-4 py-2 rounded-lg border border-gray-300 hover:border-primary-500 hover:bg-background">
                        Delivery Time
                    </button>

                    <div className="ml-auto">
                        <DropdownInput
                            placeholder="Sort by"
                            name="sort"
                            options={sortOptions.map(option => ({
                                label: option.label,
                                value: JSON.stringify(option.value)
                            }))}
                            value={selectedSort ? {
                                label: selectedSort.label,
                                value: JSON.stringify(selectedSort.value)
                            } : null}
                            onChange={(option) => handleSortChange(option.value)}
                            className="text-sm max-w-42 py-2!"
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 min-h-100 mt-2">
                <p className="text-sm text-gray-600 mb-4">
                    {loading ? "Loading..." : `${total.toLocaleString()} gig${total !== 1 ? 's' : ''} found`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                    {loading ? (
                        Array.from({length: 8}).map((_, i) => <GigSkeleton variant={'default'} key={i}/>)
                    ) : gigs.length > 0 ? (
                        gigs.map((g) => <GigCard variant={'default'}
                                                 key={g._id} {...g} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-500 py-8">
                            No gigs found. Try adjusting your filters.
                        </p>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-6 py-10">
                <Pagination
                    siblingCount={3}
                    totalCount={total}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* === MENU CATEGORY === */}
            <MenuDropdown
                anchorRef={categoryBtnRef}
                isOpen={openMenu.category}
                onClose={() => setOpenMenu(p => ({...p, category: false}))}
                className="flex flex-col gap-1 overflow-y-auto min-w-[200px] scrollbar-beautiful p-2"
            >
                {categories.map((category) => {
                    const isSelected = category === "All Categories" ? selectedCategory === "" : selectedCategory === category;
                    return (
                        <li
                            key={toSlug(category)}
                            onClick={() => handleCategorySelect(category)}
                            className={`flex flex-row items-center gap-2 pl-2 pr-4 py-2.5 hover:bg-gray-100 cursor-pointer rounded-md transition-colors ${
                                isSelected ? 'bg-gray-100' : ''
                            }`}
                        >
                            <Check size={16}
                                   className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}/>
                            <span className="text-md text-gray-800">{category}</span>
                        </li>
                    );
                })}
            </MenuDropdown>

            {/* === BUDGET MENU === */}
            <MenuDropdown
                anchorRef={budgetBtnRef}
                isOpen={openMenu.budget}
                placement="bottom-start"
                onClose={() => {
                    setTempBudget({
                        type: appliedBudget.min > 0 || appliedBudget.max < 100000 ? 'custom' : 'preset',
                        min: appliedBudget.min || undefined,
                        max: appliedBudget.max < 100000 ? appliedBudget.max : undefined,
                    });
                    setOpenMenu(p => ({...p, budget: false}));
                }}
                className="flex flex-col gap-1 overflow-y-auto w-[280px] scrollbar-beautiful p-2"
            >
                {budgets.map((budget, index) => {
                    const isSelected =
                        tempBudget.type === 'preset' &&
                        tempBudget.min === budget.value.min &&
                        tempBudget.max === budget.value.max;
                    return (
                        <li key={index}
                            onClick={() => handleTempBudgetChange('preset', budget.value.min, budget.value.max)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-md">
                            <input type="radio" name="budget" checked={isSelected} readOnly
                                   className="w-4 h-4 text-primary-600"/>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-800">{budget.title}</span>
                                <span className="text-xs text-gray-500">{budget.description}</span>
                            </div>
                        </li>
                    );
                })}

                <li className="flex flex-col justify-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-md">
                    <div onClick={() => handleTempBudgetChange('custom')}
                         className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" name="budget" checked={tempBudget.type === 'custom'} readOnly
                               className="w-4 h-4 text-primary-600"/>
                        <span className="text-sm font-medium text-gray-800">Custom</span>
                    </div>

                    {tempBudget.type === 'custom' && (
                        <div className="flex flex-col gap-3 pl-4">
                            <div>
                                <FormLabel label="Min" className="text-xs text-gray-600"/>
                                <Input
                                    type="number"
                                    value={tempBudget.min ?? ''}
                                    onChange={(e) => handleCustomMinChange(e.target.value)}
                                    leftIcon={<DollarSign size={14} className="text-gray-500"/>}
                                    className="text-sm py-1.5"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <FormLabel label="Max" className="text-xs text-gray-600"/>
                                <Input
                                    type="number"
                                    value={tempBudget.max ?? ''}
                                    onChange={(e) => handleCustomMaxChange(e.target.value)}
                                    leftIcon={<DollarSign size={14} className="text-gray-500"/>}
                                    className="text-sm py-1.5"
                                    placeholder="No limit"
                                />
                            </div>
                        </div>
                    )}
                </li>

                <div className="flex flex-row justify-between border-t border-gray-300 p-2 pt-4">
                    <button onClick={clearBudget}
                            className="btn btn-text p-2 text-sm text-gray-600">Clear
                    </button>
                    <button onClick={applyBudget}
                            className="btn btn-soft px-4 py-1.5 text-sm text-white bg-black hover:opacity-80">Apply
                    </button>
                </div>
            </MenuDropdown>

            {/* === DELIVERY MENU === */}
            <MenuDropdown
                anchorRef={deliveryBtnRef}
                isOpen={openMenu.delivery}
                placement="bottom-start"
                onClose={() => {
                    setTempDelivery(appliedDelivery); // Đã có appliedDelivery
                    setOpenMenu(p => ({...p, delivery: false}));
                }}
                className="flex flex-col gap-1 overflow-y-auto w-[280px] scrollbar-beautiful p-2"
            >
                {deliveries.map((delivery, index) => {
                    const isSelected = tempDelivery === delivery.value;
                    return (
                        <li key={index}
                            onClick={() => handleTempDeliveryChange(delivery.value)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer rounded-md">
                            <input type="radio" name="delivery" checked={isSelected} readOnly
                                   className="w-4 h-4 text-primary-600"/>
                            <span className="text-sm font-medium text-gray-800">{delivery.title}</span>
                        </li>
                    );
                })}

                <div className="flex flex-row justify-between border-t border-gray-300 p-2 pt-4">
                    <button onClick={clearDelivery}
                            className="btn btn-text p-2 text-sm text-gray-600">Clear
                    </button>
                    <button onClick={applyDelivery}
                            className="btn btn-soft px-4 py-1.5 text-sm text-white bg-black hover:opacity-80">Apply
                    </button>
                </div>
            </MenuDropdown>
        </div>
    );
}