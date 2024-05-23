import swal from "sweetalert";

export const invalidInputSwal = (text) => {
  swal({
    title: "Oops!",
    text,
    icon: "error",
  });
};

export const successInputSwal = (text) => {
  swal({
    title: "Successfully",
    text,
    icon: "success",
  });
};
