'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';

type MediaViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  media: {
    type: 'image' | 'pdf';
    url: string;
    title: string;
  };
};

export function MediaViewer({ isOpen, onClose, media }: MediaViewerProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {media.title}
                </Dialog.Title>
                <div className="mt-2">
                  {media.type === 'image' ? (
                    <div className="relative w-full h-[60vh]">
                      <Image
                        src={media.url}
                        alt={media.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <iframe
                      src={media.url}
                      className="w-full h-[60vh]"
                      title={media.title}
                    />
                  )}
                </div>
                <button
                  type="button"
                  className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                  onClick={onClose}
                >
                  Cerrar
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
