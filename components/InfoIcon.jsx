import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const isWeb = Platform.OS === 'web';

const InfoIcon = ({ 
  tooltip, 
  size = 16, 
  color = '#3b82f6', 
  style,
  position = 'top' // 'top', 'bottom', 'left', 'right'
}) => {
  const [showModal, setShowModal] = useState(false);
  const iconRef = useRef(null);

  // Add CSS animations for web
  useEffect(() => {
    if (isWeb) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .info-icon-container:hover .info-icon {
          animation: iconPulse 1.5s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
    }
  }, []);

  const handlePress = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  return (
    <View style={[styles.container, style]} {...(isWeb && { className: 'info-icon-container' })}>
      <TouchableOpacity
        ref={iconRef}
        onPress={handlePress}
        style={styles.iconContainer}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="information-circle-outline" 
          size={size} 
          color={color}
          style={{
            ...(isWeb && {
              filter: 'drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))',
              className: 'info-icon',
            }),
          }}
        />
      </TouchableOpacity>
      
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Information</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>{tooltip}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        transform: 'scale(1.1)',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 0,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    ...(isWeb && {
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 25px rgba(0, 0, 0, 0.2)',
    }),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    ...(isWeb && {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
  closeButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#e5e7eb',
      },
    }),
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    padding: 20,
    paddingTop: 15,
    ...(isWeb && {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
  },
});

export default InfoIcon;
