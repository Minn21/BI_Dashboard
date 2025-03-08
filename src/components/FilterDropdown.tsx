'use client';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export function FilterDropdown() {
  const filters = ['All', 'Members', 'General Guests', 'Canceled'];
  
  return (
    <Menu as="div" className="relative w-full sm:w-auto">
      <Menu.Button className="
        flex items-center justify-between
        w-full sm:w-auto
        bg-gray-800/70 hover:bg-gray-700/70
        text-gray-300 hover:text-gray-100
        px-4 py-3 sm:px-4 sm:py-2
        rounded-lg shadow-md
        border border-gray-700/50
        transition-all
        text-base sm:text-sm
        font-medium
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
      ">
        <span>Filter by</span>
        <ChevronDownIcon 
          className="w-5 h-5 ml-2 -mr-1 text-gray-400"
          aria-hidden="true"
        />
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
        <Menu.Items className="
          absolute right-0 sm:left-0 mt-2
          w-full sm:w-48
          origin-top
          bg-gray-800
          rounded-lg
          shadow-lg
          ring-1 ring-black ring-opacity-5
          border border-gray-700/30
          backdrop-blur-sm
          z-50
          min-w-[160px]
        ">
          <div className="p-1">
            {filters.map((filter) => (
              <Menu.Item key={filter}>
                {({ active }) => (
                  <button
                    className={`
                      ${active ? 'bg-gray-700/50 text-gray-100' : 'text-gray-300'}
                      block w-full
                      px-4 py-3 sm:py-2
                      text-left
                      text-sm sm:text-[13px]
                      rounded-md
                      transition-colors
                      focus:outline-none focus:bg-gray-700/50
                    `}
                  >
                    {filter}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}