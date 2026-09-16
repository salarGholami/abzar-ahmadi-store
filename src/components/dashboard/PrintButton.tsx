"use client";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary">
      <Printer size={17} />چاپ
    </button>
  );
}
