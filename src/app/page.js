import React from 'react'
import Table from './components/Table'

export default async function page() {

  const res = await fetch('https://66eaaa1a55ad32cda479e5f9.mockapi.io/students');
  const data = await res.json();
  console.log(data);
  
  
  return (
    <Table data={data} />
  )
}
