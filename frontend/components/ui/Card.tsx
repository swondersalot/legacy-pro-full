import React from "react";

type CardProps = {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-4">
      {children}
    </div>
  );
};

export default Card;
