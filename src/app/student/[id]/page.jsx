"use client";
import { Fetch } from "@/app/hooks/use-fetch";
import { Put } from "@/app/hooks/use-put";

export default function Page({ params }) {
  const StudentId = params.id;
  const res = Fetch(`/students/${StudentId}`);
  const data = res[0];
  // console.log(data);

  const [loading, handleChange, handleSubmit] = Put(`/students/${StudentId}`)

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-[420px]">
        <input
          type="text"
          className="text-black"
          onChange={handleChange}
          name="fullName"
          placeholder="Name"
        />
        <input
          type="text"
          className="text-black"
          onChange={handleChange}
          name="age"
          placeholder="Age"
        />
        <input
          type="text"
          className="text-black"
          onChange={handleChange}
          name="email"
          placeholder="Email"
        />
        <input
          type="text"
          className="text-black"
          onChange={handleChange}
          name="desc"
          placeholder="Description"
        />

        <button type="submit" className="px-4 py-1 bg-green-500">{loading? "Loading.." : "Save" }</button>
      </form>
    </div>
  );
}
