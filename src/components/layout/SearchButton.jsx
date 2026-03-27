import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import SearchModal from './SearchModal';

const SearchButton = ({ onSearch, onClear }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSearch = (searchData) => {
    if (onSearch) {
      onSearch(searchData);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  return (
    <>
      <div className="text-center">
        <div 
          className="border rounded p-2 bg-light d-inline-block cursor-pointer search-button-hover transition-all"
          onClick={handleOpenModal}
          style={{ cursor: 'pointer' }}
          title="Smart Search"
        >
          <FaSearch size={24} className="text-primary" />
        </div>
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
