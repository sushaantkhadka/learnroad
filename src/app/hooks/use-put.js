import axios from "axios";
import { useState } from "react";

export const Put = ([urlPath]) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  //   console.log(form);

  const handleChange = (e) => {
    setForm((prev) => {
      return {
        ...prev,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleSubmit = () => {
    event.preventDefault();
    setLoading(true);
    const response = axios.put(
      `https://66eaaa1a55ad32cda479e5f9.mockapi.io${urlPath}`,
      form
    );
    setLoading(false);

    return response;
  };

  return [loading, handleChange, handleSubmit];
};
