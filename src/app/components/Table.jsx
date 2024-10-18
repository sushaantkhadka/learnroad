import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Table({ data }) {

    const students = data

    return (
        <div className='flex flex-col justify-center items-center m-10 gap-5'>
           {students.map((student) => (
                        <div key={student.id} className='border-[1px] border-white p-4 rounded-xl w-[750px]'>
                            <div className='flex mb-1 gap-4'>
                                <Image alt={student.avatar} src={student.avatar} width={100} height={100} className='rounded-full w-[200px] h-[200px]' />
                                <div className='flex flex-col gap-6'>
                                    <div>
                                    <h2 className='text-[32px] font-bold'>{student.fullName}</h2>
                                    <p className='text-gray-400'>{student.email}</p>
                                    </div>
                                    <p>{student.desc}</p>
                                    <Link href={`/student/${student.id}`} >
                                    <button className='bg-green-500 px-6 py-2 rounded-md'>Edit</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

        </div>
    )
}
