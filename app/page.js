"use client";

import { useState } from "react";

import styles from "../styles/Home.module.css";

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus({ message: "", type: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setStatus({ message: "Iltimos, avval fayl tanlang!", type: "error" });
      return;
    }

    setIsLoading(true);
    setStatus({
      message: "Fayl yuborilmoqda, iltimos kuting...",
      type: "loading",
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/send-file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ message: result.message, type: "success" });
      } else {
        setStatus({ message: `Xatolik: ${result.message}`, type: "error" });
      }
    } catch (error) {
      setStatus({
        message: "Server bilan bog'lanishda kutilmagan xatolik yuz berdi.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
      setFile(null); // Faylni tozalash
      e.target.reset(); // Formani tozalash
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Faylni Telegramga Yuborish</h1>

        <p className={styles.description}>
          Faylni tanlang va uni o'zingizning "Saved Messages"ga yuboring.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isLoading}
            className={styles.input}
          />
          <button
            type="submit"
            disabled={isLoading || !file}
            className={styles.button}
          >
            {isLoading ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </form>

        {status.message && (
          <p className={`${styles.status} ${styles[status.type]}`}>
            {status.message}
          </p>
        )}
      </main>
    </div>
  );
}
