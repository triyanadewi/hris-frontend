import Swal from 'sweetalert2';

export const useSweetAlert = () => {
  // Toast notifications
  const showToast = (
    type: "success" | "error" | "warning" | "info",
    message: string,
    duration: number = 3000
  ) => {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: duration,
      timerProgressBar: true,
      width: "350px",
      customClass: {
        popup: 'colored-toast'
      },
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    return Toast.fire({
      icon: type,
      title: message,
    });
  };

  // Confirmation dialog
  const showConfirmDialog = async (
    title: string,
    text: string,
    confirmText: string = "Yes, proceed!",
    cancelText: string = "Cancel",
    icon: "question" | "warning" | "info" = "question"
  ) => {
    return await Swal.fire({
      title: title,
      text: text,
      icon: icon,
      showCancelButton: true,
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true,
      focusCancel: true,
    });
  };

  // Loading dialog
  const showLoadingSwal = (message: string = "Processing...") => {
    Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading(null);
      },
    });
  };

  // Success dialog
  const showSuccessDialog = async (
    title: string = "Success!",
    text: string,
    timer: number = 2000
  ) => {
    return await Swal.fire({
      title: title,
      text: text,
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#1E3A5F",
      timer: timer,
      timerProgressBar: true,
    });
  };

  // Error dialog
  const showErrorDialog = async (
    title: string = "Error!",
    text: string,
    confirmText: string = "OK"
  ) => {
    return await Swal.fire({
      title: title,
      text: text,
      icon: "error",
      confirmButtonText: confirmText,
      confirmButtonColor: "#dc2626",
    });
  };

  // Warning dialog
  const showWarningDialog = async (
    title: string = "Warning!",
    text: string,
    confirmText: string = "OK"
  ) => {
    return await Swal.fire({
      title: title,
      text: text,
      icon: "warning",
      confirmButtonText: confirmText,
      confirmButtonColor: "#f59e0b",
    });
  };

  // Info dialog
  const showInfoDialog = async (
    title: string = "Information",
    text: string,
    confirmText: string = "OK"
  ) => {
    return await Swal.fire({
      title: title,
      text: text,
      icon: "info",
      confirmButtonText: confirmText,
      confirmButtonColor: "#3b82f6",
    });
  };

  // Input dialog
  const showInputDialog = async (
    title: string,
    inputPlaceholder: string = "",
    inputType: "text" | "email" | "password" | "number" | "tel" | "url" = "text",
    inputValue: string = ""
  ) => {
    return await Swal.fire({
      title: title,
      input: inputType,
      inputPlaceholder: inputPlaceholder,
      inputValue: inputValue,
      showCancelButton: true,
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
        return null;
      },
    });
  };

  // Custom dialog with HTML content
  const showCustomDialog = async (
    title: string,
    html: string,
    showCancelButton: boolean = false,
    confirmText: string = "OK",
    cancelText: string = "Cancel"
  ) => {
    return await Swal.fire({
      title: title,
      html: html,
      showCancelButton: showCancelButton,
      confirmButtonColor: "#1E3A5F",
      cancelButtonColor: "#6b7280",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
  };

  // Close any open Swal
  const closeSwal = () => {
    Swal.close();
  };

  // Check if Swal is open
  const isSwalOpen = () => {
    return Swal.isVisible();
  };

  return {
    showToast,
    showConfirmDialog,
    showLoadingSwal,
    showSuccessDialog,
    showErrorDialog,
    showWarningDialog,
    showInfoDialog,
    showInputDialog,
    showCustomDialog,
    closeSwal,
    isSwalOpen,
    Swal, // Export Swal instance for advanced usage
  };
};