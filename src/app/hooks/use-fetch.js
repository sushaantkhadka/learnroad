import axios from "axios";
import { useEffect, useState } from "react"

export const Fetch = (urlPath) => {
    const [data, setData] = useState([])
    

    useEffect(() => {
        ;(async () => {
            try {
                const response =  await axios.get('https://66eaaa1a55ad32cda479e5f9.mockapi.io' + urlPath)
                setData(response.data)
            } catch (error) {
                alert("Something went wrong")

                throw error
            }
        })()
    },[urlPath]);

    return [data]
}