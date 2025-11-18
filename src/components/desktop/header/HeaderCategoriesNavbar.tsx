'use client';

import Navbar from "@/components/shared/Navbar";
import NavbarItem from "@/components/shared/NavbarItem";
import clsx from "clsx";
import {GIG_CATEGORIES} from "@/lib/constants/constant";
import {toSlug} from "@/lib/utils/helper";

export default function HeaderCategoriesNavbar() {

    return (
        <div className={clsx('border-t border-gray-200 border-b')}>
            <Navbar gap={4} className={'mx-auto container px-6'}>
                {GIG_CATEGORIES.map((category) => (
                    <NavbarItem
                        key={category.category} href={`/categories/${toSlug(category.category)}`}>
                        {category.category}
                    </NavbarItem>
                ))}
            </Navbar>
        </div>
    )
}