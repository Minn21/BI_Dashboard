'use client';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

// Filter Dropdown Component
export function FilterDropdown() {
  const filters = ['All', 'Members', 'General Guests', 'Canceled'];
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="bg-gray p-2 rounded-lg shadow-sm border border-gray-200">
        Filter by
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
        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          {filters.map((filter) => (
            <Menu.Item key={filter}>
              {({ active }) => (
                <button
                  className={`${active ? 'bg-gray-100' : ''} block w-full text-left px-4 py-2 text-sm text-black-700`}
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