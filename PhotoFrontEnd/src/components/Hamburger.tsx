import { useState } from "react";
import "../styles/HamBurgerStyles.css";

interface Props {
  isOpen: boolean;
}

const Hamburger = ({ isOpen }: Props) => {
  return (
      <div className="hamburger">
        <div className="burger" />
        <div className="burger" />
        <div className="burger" />
      </div>
  );
};

export default Hamburger;
