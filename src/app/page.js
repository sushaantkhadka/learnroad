'use client'
import Table from './components/Table';
import { Fetch } from './hooks/use-fetch';

export default function page() {

  const [data] =  Fetch('/students')
  // const res = await fetch('https://66eaaa1a55ad32cda479e5f9.mockapi.io/students');
  // const data = await res.json();
  // console.log(data);
  
  
  return (
    <Table data={data} />
  )
}
