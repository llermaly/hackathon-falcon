"use client";
import { FaChevronRight } from "react-icons/fa6";
import CurrentJob from "@/components/current-job";
import NewJob from "@/components/new-job";
import LearningPath from "@/components/learning-path";
import { AppProvider } from "@/context/app-context";
import { Suspense } from "react";
import Button from "@/components/button";
import LoadExampleButton from "@/components/load-example-btn";

export default function Home() {
  return (
    <Suspense>
      <AppProvider>
        <div className="px-4 pb-24 pt-8">
          <h1 className="mb-4 px-4 text-center text-3xl font-bold text-white">
            Destiny Crafter
          </h1>
          <main className="mx-auto max-w-[1400px] rounded-md bg-white bg-opacity-30 p-8">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-4 rounded-md border bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold uppercase text-blue-600">
                    Career
                  </span>
                  <LoadExampleButton />
                </div>
                <div className="mt-4">
                  <p className="text-xl font-semibold text-black">
                    Current situation
                  </p>
                </div>
                <div className="mt-2">
                  <CurrentJob />
                </div>
                <div className="mt-2">
                  <NewJob />
                </div>
              </div>
              <div className="col-span-8 rounded-md border bg-white p-4">
                <LearningPath />
              </div>
            </div>
          </main>
        </div>
      </AppProvider>
    </Suspense>
  );
}
