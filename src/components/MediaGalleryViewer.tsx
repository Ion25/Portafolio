'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import Image from 'next/image';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type Media = {
  type: 'image' | 'pdf';
  url: string;
  title: string;
  thumbnail?: string;
};

type MediaGalleryViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  medias: Media[];
  initialSlide?: number;
};

export function MediaGalleryViewer({ isOpen, onClose, medias, initialSlide = 0 }: MediaGalleryViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide,
    afterChange: (index: number) => setCurrentSlide(index),
    prevArrow: <button className="slick-prev" aria-label="Previous">❮</button>,
    nextArrow: <button className="slick-next" aria-label="Next">❯</button>,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          arrows: true,
          dots: false
        }
      }
    ]
  };

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
                  {medias[currentSlide]?.title}
                </Dialog.Title>
                
                <div className="mt-2 gallery-container">
                  <style jsx global>{`
                    .gallery-container .slick-prev,
                    .gallery-container .slick-next {
                      font-size: 24px;
                      color: white;
                      width: 40px;
                      height: 40px;
                      background: rgba(0, 0, 0, 0.5);
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      z-index: 1;
                      transition: all 0.3s ease;
                    }
                    .gallery-container .slick-prev:hover,
                    .gallery-container .slick-next:hover {
                      background: rgba(0, 0, 0, 0.8);
                    }
                    .gallery-container .slick-prev {
                      left: 20px;
                    }
                    .gallery-container .slick-next {
                      right: 20px;
                    }
                    .gallery-container .slick-dots {
                      bottom: -30px;
                    }
                    .gallery-container .slick-dots li button:before {
                      color: #666;
                    }
                  `}</style>
                  <Slider {...settings}>
                    {medias.map((media, index) => (
                      <div key={index} className="outline-none px-1">
                        {media.type === 'image' ? (
                          <div className="relative w-full h-[60vh]">
                            <Image
                              src={media.url}
                              alt={media.title}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                              priority={index === currentSlide}
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
                    ))}
                  </Slider>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {currentSlide + 1} de {medias.length}
                  </p>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200"
                    onClick={onClose}
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
