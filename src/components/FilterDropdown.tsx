'use client';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
//import { ChevronDownIcon } from '@heroicons/react/solid';

// Filter Dropdown Component
export function FilterDropdown() {
  const filters = ['All', 'Members', 'General Guests', 'Canceled'];
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 bg-gray-800/70 text-gray-300 px-4 py-2 rounded-lg shadow-md border border-gray-700/50 hover:bg-gray-700/70 transition-all text-sm font-medium">
        <span>Filter by</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-700/30 backdrop-blur-sm">
          {filters.map((filter) => (
            <Menu.Item key={filter}>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-gray-700/50' : ''} block w-full text-left px-4 py-2 text-sm ${active ? 'text-gray-100' : 'text-gray-300'} first:rounded-t-lg last:rounded-b-lg hover:text-gray-100 transition-colors`}
                >
                  {filter}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}