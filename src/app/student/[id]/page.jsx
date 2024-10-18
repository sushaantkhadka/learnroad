import { useState } from "react";


export default async function Page({ params }) {
  const StudentId = params.id;
  const [name, setName] = useState();

  const res = await fetch(
    `https://66eaaa1a55ad32cda479e5f9.mockapi.io/students/${StudentId}`
  );
  const data = await res.json();

  const handleSubmit = async (e) => {
    const res = await fetch(
      `https://66eaaa1a55ad32cda479e5f9.mockapi.io/students/post/${StudentId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          amount,
          email,
          status,
        }),
      }
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" className="text-black" value={data.name} onChange={(e) => setName(e.target.value) } name="name" />
      </form>
    </div>
  );
}
