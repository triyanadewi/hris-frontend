"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import LetterForm from "@/components/LetterFormAdmin";

export default function AddLetterManagementPage() {
  const { setTitle } = usePageTitle();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setTitle("Letter Management");
  }, [setTitle]);

  const handleAdd = async (data: any) => {
  };

  return (
      <LetterForm mode="add" onSubmit={handleAdd} />
  );
}
