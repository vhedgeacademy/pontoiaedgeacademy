import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar aluno"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-12 pr-6 py-3 rounded-full border border-blue focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
      />
    </div>
  );
};

export default SearchBar;