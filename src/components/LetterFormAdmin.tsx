"use client";
import { useEffect, useState } from "react";
import { usePageTitle } from "@/context/PageTitleContext";

type LetterFormProps = {
    mode: "add" | "edit";
    initialData?:any;
    onSubmit: (data:any)=>void;
}

export default function AddLetterManagementPage({
    mode,
    initialData,
    onSubmit,
}: LetterFormProps) {
    
  const { setTitle } = usePageTitle();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const [title, setTitleText] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    setTitle("Letter Management");
  }, [setTitle]);



  return (
    <div className="min-h-screen bg-gray-100 p-6">
    </div>
  );
}
