import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import SearchModal from './SearchModal';

const SearchButton = ({ onSearch, onClear }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSearch = (searchData) => {
    if (onSearch) onSearch(searchData);
  };

  const handleClear = () => {
    if (onClear) onClear();
  };

  return (
    <>
      <div className="flex justify-center group">
        <button
          className="w-10 h-10 flex items-center justify-center bg-white border-2 border-primary/20 rounded-2xl text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-90 group-hover:-translate-y-1 shadow-sm"
          onClick={handleOpenModal}
          title="Smart Search"
        >
          <FiSearch size={24} strokeWidth={2.5} />
        </button>
      </div>

      <SearchModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSearch={handleSearch}
        onClear={handleClear}
      />
    </>
  );
};

export default SearchButton;
