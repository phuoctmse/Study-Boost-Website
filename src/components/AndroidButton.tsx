import React from 'react'
import clsx from 'clsx'

import { ctaDetails } from '@/data/cta'

const AndroidButton = ({ dark }: { dark?: boolean }) => {
    return (
        <a href={ctaDetails.googlePlayUrl} download>
            <button
                type="button"
                className={clsx("flex items-center justify-center min-w-[205px] mt-3 px-6 h-14 rounded-full w-full sm:w-fit", { "text-white bg-foreground": dark, "text-foreground bg-white": !dark })}
            >
                <div className="mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                        <path fill="#3DDC84" d="M17.523 15.34a1.11 1.11 0 01-1.116 1.116 1.11 1.11 0 01-1.115-1.116 1.11 1.11 0 011.115-1.116 1.11 1.11 0 011.116 1.116m-9.815 0a1.11 1.11 0 01-1.115 1.116 1.11 1.11 0 01-1.116-1.116 1.11 1.11 0 011.116-1.116 1.11 1.11 0 011.115 1.116m10.663-5.287l1.923-3.329a.4.4 0 00-.146-.546.4.4 0 00-.547.146l-1.948 3.374c-1.48-.678-3.14-1.055-4.903-1.055-1.763 0-3.423.377-4.903 1.055L6.899 6.324a.4.4 0 00-.547-.146.4.4 0 00-.146.546l1.923 3.33C5.555 11.714 4 14.359 4 17.337c0 .193.01.383.024.57h15.952c.014-.187.024-.377.024-.57 0-2.978-1.555-5.623-4.13-7.284M24 17.337c0 2.754-1.787 4.998-3.993 4.998H3.993C1.787 22.335 0 20.091 0 17.337 0 14.194 2.21 11.361 5.426 10.246c1.7-.64 3.631-.984 5.574-.984 1.943 0 3.874.344 5.574.984 3.216 1.115 5.426 3.948 5.426 7.091"/>
                    </svg>
                </div>
                <div>
                    <div className="text-xs">
                    GET IT ON
                    </div>
                    <div className="-mt-1 font-sans text-xl font-semibold">
                        Android
                    </div>
                </div>
            </button>
        </a>
    )
}

export default AndroidButton 