/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CityLocation, TabType } from './types';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IstikharahView } from './components/IstikharahView';
import { TasbihView } from './components/TasbihView';
import { VaultView } from './components/VaultView';
import { SettingsView } from './components/SettingsView';
import { KhatamView } from './components/KhatamView';
import { ReflectionsView } from './components/ReflectionsView';
import { AudioHubView } from './components/AudioHubView';
import { Navbar } from './components/Navbar';
import { LocationModal } from './components/LocationModal';
import { EtiquetteModal } from './components/EtiquetteModal';
import { PrayerNotificationToast } from './components/PrayerNotificationToast';
import { OfflineBanner } from './components/OfflineBanner';
import { getFormattedHijriDate } from './utils/prayerCalculator';
import { useNoorStore } from './store/useNoorStore';
import { SholatSlot } from './types';

export default function App() {
  const store = useNoorStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals
  const [locationModalOpen, setLocationModalOpen] = useState<boolean>(false);
  const [etiquetteModalOpen, setEtiquetteModalOpen] = useState<boolean>(false);

  const hijriDate = getFormattedHijriDate();

  // Calendar date formatted
  const calendarDateText = store.currentTime.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handleSelectCity = (newCity: CityLocation) => {
    store.setCity(newCity.name);
    store.setCoords({ lat: newCity.lat, lng: newCity.lng });
  };

  const handleSelectGPS = (lat: number, lng: number) => {
    store.setCoords({ lat, lng });
    store.setCity('GPS Fixed');
  };

  return (
    <div className="min-h-screen bg-[#041210] relative text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Dynamic Atmospheric Ambient Glow Orbs */}
      <div 
        className="ambient-orb w-72 h-72 bg-emerald-500 top-[-20px] left-[-40px]" 
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="ambient-orb w-64 h-64 bg-[#D4AF37] top-[340px] right-[-30px]" 
        style={{ animationDelay: '-5s' }}
      />
      <div 
        className="ambient-orb w-80 h-80 bg-teal-600 bottom-[120px] left-[10%] opacity-20" 
        style={{ animationDelay: '-8s' }}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineBanner />

      {/* Main Container: fluidly responsive from mobile 430px up to 12-column desktop grid */}
      <div className="w-full max-w-[430px] md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen relative z-10 px-3 sm:px-4 pt-4 pb-28 flex flex-col justify-between transition-all duration-300">
        {/* Top App Bar / Header */}
        <Header
          city={store.city}
          hijriDate={hijriDate}
          audioAlerts={store.audioAlerts}
          onToggleAudio={() => store.setAudioAlerts(!store.audioAlerts)}
          onOpenLocationModal={() => setLocationModalOpen(true)}
        />

        {/* Dynamic Animated View Area */}
        <main id="app-main-content" className="flex-1 w-full pb-4">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardView
                  store={store}
                  calendarDateText={calendarDateText}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'istikharah' && (
              <motion.div
                key="istikharah"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <IstikharahView
                  onOpenEtiquetteModal={() => setEtiquetteModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'tasbih' && (
              <motion.div
                key="tasbih"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <TasbihView
                  hapticEnabled={store.hapticEnabled}
                  onToggleHaptic={() => store.setHapticEnabled(!store.hapticEnabled)}
                />
              </motion.div>
            )}

            {activeTab === 'vault' && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <VaultView onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} />
              </motion.div>
            )}

            {activeTab === 'khatam' && (
              <motion.div
                key="khatam"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <KhatamView
                  plan={store.khatamPlan}
                  onUpdatePlan={store.updateKhatamPlan}
                  onBackToDashboard={() => {
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'reflections' && (
              <motion.div
                key="reflections"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <ReflectionsView
                  onBackToDashboard={() => {
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <AudioHubView
                  onBackToDashboard={() => {
                    setActiveTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="max-w-[430px] mx-auto"
              >
                <SettingsView
                  calcMethod={store.calcMethod}
                  madhab={store.madhab}
                  audioAlerts={store.audioAlerts}
                  cityName={store.city}
                  notificationPermission={store.notificationPermission}
                  onRequestPermission={store.requestBrowserPermission}
                  onTriggerTestNotification={store.triggerTestNotification}
                  onCalcMethodChange={store.setCalcMethod}
                  onMadhabChange={store.setMadhab}
                  onToggleAudio={() => store.setAudioAlerts(!store.audioAlerts)}
                  onOpenLocationModal={() => setLocationModalOpen(true)}
                  storageStats={store.storageStats}
                  onSyncOfflineData={store.syncOfflineData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Subtle In-App Floating Liquid Glass Prayer Notification Toast */}
      <PrayerNotificationToast
        notification={store.activeNotification}
        onClose={store.dismissNotification}
        onLogPrayer={(prayerName) => {
          const validSlots: SholatSlot[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
          if (validSlots.includes(prayerName as SholatSlot)) {
            store.toggleSholat(prayerName as SholatSlot, 'jamaah');
          }
        }}
        onToggleAudio={() => store.setAudioAlerts(!store.audioAlerts)}
      />

      {/* Floating Liquid Glass Bottom Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Modals */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectCity={handleSelectCity}
        onSelectGPS={handleSelectGPS}
      />

      <EtiquetteModal
        isOpen={etiquetteModalOpen}
        onClose={() => setEtiquetteModalOpen(false)}
      />
    </div>
  );
}
