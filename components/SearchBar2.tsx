import React from "react";

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
}

const SearchBar2: React.FC<SearchBarProps> = ({ query, setQuery }) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  return (
    <input
      type="text"
      value={query}
      onChange={handleInputChange}
      placeholder="Search..."
    />
  );
};

export default SearchBar2;
