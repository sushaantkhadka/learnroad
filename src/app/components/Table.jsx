import Link from 'next/link'
import React from 'react'

export default function Table({ data }) {

    const students = data

    return (
        <div className='flex justify-center m-10'>
            <div>
                <div className='bg-gray-300 flex text-black font-bold py-2'>
                <h2 className='w-[50px] mx-2'>#</h2>
                <h2 className='w-[250px] mx-2'>Student Name</h2>
                <h2 className='w-[100px] mx-2'>Amount</h2>
                <h2 className='w-[250px] mx-2'>Email</h2>
                <h2 className='w-[100px] mx-2'>Status</h2>
                </div>

                <div>
                    {students.map((student) => (
                        <div key={student.id} className='my-1'>
                            <div className='flex mb-1'>
                            <p className='w-[50px] mx-2'>{student.id}</p>
                            <p className='w-[250px] mx-2'>{student.name}</p>
                            <p className='w-[100px] mx-2'>{student.amount}</p>
                            <p className='w-[250px] mx-2'>{student.email}</p>
                            <p className='w-[100px] mx-2'>{student.status}</p>
                            <Link href={`/student/${student.id}`}> <p className='px-2 bg-green-500 text-black rounded-md'>Edit</p></Link>
                            </div>
                            <hr />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
