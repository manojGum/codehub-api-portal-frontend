import React from 'react';

import ModalStyle from './Modal.module.css'
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className={ModalStyle.modal_overlay}>
      <div className={ModalStyle.modal}>
        <button className={ModalStyle.modal_close} onClick={onClose}>X</button>
        <div className={ModalStyle.modal_content}>
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;