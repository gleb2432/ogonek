import React, { useState } from 'react';
import { useMenuData, useCart } from './hooks';
import { useKiosk } from './hooks/useKiosk';
import { MenuApp } from './components/MenuApp';
import { AdminPanel } from './components/AdminPanel';
import { PinPadModal } from './components/PinPadModal';

export default function App() {
  const { 
    categories, 
    products, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    moveCategory,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductAvailability,
    setAllProductsAvailability,
    importMenuData,
    resetToDefault 
  } = useMenuData();
  const { cart, addToCart, updateQuantity, clearCart, total } = useCart();
  const {
    pin,
    setPin,
    isKioskEnabled,
    enableKiosk,
    disableKiosk,
    isPinModalOpen,
    pinActionTarget,
    openPinModal,
    closePinModal,
    handleSecretLogoTap,
  } = useKiosk();

  const [currentView, setCurrentView] = useState<'menu' | 'admin'>('menu');

  const handleAdminRequest = () => {
    if (isKioskEnabled) {
      openPinModal('admin');
    } else {
      setCurrentView('admin');
    }
  };

  const handlePinSuccess = (target: 'admin' | 'exit_kiosk' | 'settings') => {
    closePinModal();
    if (target === 'admin' || target === 'settings') {
      setCurrentView('admin');
    } else if (target === 'exit_kiosk') {
      disableKiosk();
    }
  };

  return (
    <>
      {currentView === 'admin' ? (
        <AdminPanel 
          categories={categories}
          products={products}
          addCategory={addCategory}
          updateCategory={updateCategory}
          deleteCategory={deleteCategory}
          moveCategory={moveCategory}
          addProduct={addProduct}
          updateProduct={updateProduct}
          deleteProduct={deleteProduct}
          toggleProductAvailability={toggleProductAvailability}
          setAllProductsAvailability={setAllProductsAvailability}
          resetToDefault={resetToDefault}
          importMenuData={importMenuData}
          onClose={() => setCurrentView('menu')}
          isKioskEnabled={isKioskEnabled}
          enableKiosk={enableKiosk}
          disableKiosk={disableKiosk}
          pin={pin}
          setPin={setPin}
        />
      ) : (
        <MenuApp 
          categories={categories}
          products={products}
          cart={cart}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          total={total}
          onOpenAdmin={handleAdminRequest}
          isKioskEnabled={isKioskEnabled}
          onSecretLogoTap={handleSecretLogoTap}
          onToggleKiosk={enableKiosk}
        />
      )}

      {/* Security PIN Pad Modal */}
      <PinPadModal
        isOpen={isPinModalOpen}
        onClose={closePinModal}
        correctPin={pin}
        actionTarget={pinActionTarget}
        onSuccess={handlePinSuccess}
        onChangePin={setPin}
        isKioskActive={isKioskEnabled}
      />
    </>
  );
}
