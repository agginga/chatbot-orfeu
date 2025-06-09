import React from "react";
import bg from "../assets/ginga-bg.svg";

const Background: React.FC = () => (
  <img
    src={bg}
    alt=""
    className="fixed inset-0 -z-10 w-[150%] h-[150%] md:w-full md:h-full object-cover translate-y-[10%] md:translate-y-0 animate-pulse pointer-events-none opacity-90"
  />
);

export default Background;
