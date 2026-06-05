import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ShieldIcon, EyeIcon, MicIcon, BrainIcon, PhoneIcon, LockIcon } from '../components/Icons/IconSet';

interface SettingsScreenProps {
  settings: {
    interactionMode: 'voice' | 'chat';
  };
  trustedContacts: { id: string; name: string; canAutoReply: boolean }[];
  subscriptionPrice: number;
}

export default function SettingsScreen({
  settings,
  trustedContacts,
  subscriptionPrice,
}: SettingsScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AXIS</Text>
        <Text style={styles.headerSub}>always watching</Text>
      </View>

      {/* Status Card — what AXIS does automatically */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>AXIS IS ACTIVE</Text>
        <Text style={styles.cardDesc}>
          AXIS manages everything automatically. No configuration needed.
        </Text>

        <View style={styles.statusRow}>
          <ShieldIcon size={18} color="#00D9FF" />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>Guardian Mode</Text>
            <Text style={styles.statusDesc}>Active. Watching silently.</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        <View style={styles.statusRow}>
          <EyeIcon size={18} color="#00D9FF" />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>Screen Reading</Text>
            <Text style={styles.statusDesc}>Learning your patterns.</Text>
          </View>
          <View style={styles.statusDot} />
        </View>

        <View style={styles.statusRow}>
          <MicIcon size={18} color="#00D9FF" />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>Interaction Mode</Text>
            <Text style={styles.statusDesc}>
              {settings.interactionMode === 'voice' ? 'Voice. I speak out loud.' : 'Chat. Silent typing.'}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <BrainIcon size={18} color="#00D9FF" />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>Personality</Text>
            <Text style={styles.statusDesc}>Evolving. Adapting to you.</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <PhoneIcon size={18} color="#00D9FF" />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>Auto-Reply</Text>
            <Text style={styles.statusDesc}>
              {trustedContacts.length > 0
                ? `Replying as you to ${trustedContacts.length} contacts.`
                : 'Learning your style. Will auto-reply when ready.'}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <LockIcon size={18} color="#00D9FF" />
          <View style={styles.statusTextWrap}>
            <Text style={styles.statusTitle}>Data</Text>
            <Text style={styles.statusDesc}>100% local. Nothing leaves your phone.</Text>
          </View>
        </View>
      </View>

      {/* Trusted Contacts */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>TRUSTED CONTACTS</Text>
        {trustedContacts.length === 0 ? (
          <Text style={styles.emptyText}>
            Tell AXIS: "Allow auto-reply to [name]" and it will handle the rest.
          </Text>
        ) : (
          trustedContacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactStatus}>
                {contact.canAutoReply ? 'auto-reply on' : 'draft only'}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* How to control AXIS */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>HOW TO CONTROL AXIS</Text>
        <Text style={styles.helpText}>
          Just talk to AXIS. It listens and adapts.
        </Text>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleQuote}>"Switch to voice mode"</Text>
        </View>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleQuote}>"Be quiet during class"</Text>
        </View>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleQuote}>"Check in less often"</Text>
        </View>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleQuote}>"Reply to Rohan automatically"</Text>
        </View>
        <View style={styles.exampleRow}>
          <Text style={styles.exampleQuote}>"You sound too formal"</Text>
        </View>
      </View>

      {/* Data & Backup */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>DATA & BACKUP</Text>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionLabel}>Export Encrypted Backup</Text>
          <Text style={styles.actionArrow}>&#8594;</Text>
        </TouchableOpacity>
      </View>

      {/* Subscription */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>SUBSCRIPTION</Text>
        <View style={styles.subContainer}>
          <Text style={styles.subPrice}>Rs. {subscriptionPrice}/month</Text>
          <Text style={styles.subDesc}>AXIS Premium</Text>
          <TouchableOpacity style={styles.subButton}>
            <Text style={styles.subButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 3,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 14,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 18,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  statusTextWrap: {
    flex: 1,
    marginLeft: 14,
  },
  statusTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  statusDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D9FF',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    fontStyle: 'italic',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  contactName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  contactStatus: {
    fontSize: 12,
    color: '#00D9FF',
  },
  helpText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 16,
  },
  exampleRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  exampleQuote: {
    fontSize: 14,
    color: '#00D9FF',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  actionArrow: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.25)',
  },
  subContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  subPrice: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginBottom: 4,
  },
  subDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
  },
  subButton: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  subButtonText: {
    color: '#0a0a0f',
    fontSize: 14,
    fontWeight: '600',
  },
});
