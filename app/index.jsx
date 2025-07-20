import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Supabase setup
const supabaseUrl = 'https://zllenqslszyocxhprhea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbGVucXNsc3p5b2N4aHByaGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NDg4NTEsImV4cCI6MjA2ODUyNDg1MX0.zY-nLw44ZQ5nQlvCRDqpA0-XMCDlgTfTpIQMKb-FMCQ';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ReportsFeedScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // default filter

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('Reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching reports:', error);
    else setReports(data);

    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('Reports')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) console.error('Failed to update status:', error);
    else {
      setReports((prev) =>
        prev.map((report) =>
          report.id === id ? { ...report, status: newStatus } : report
        )
      );
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter((r) => r.status === statusFilter);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.issue}>{item.issue}</Text>
      {item.description ? <Text>{item.description}</Text> : null}
      <Text style={styles.location}>📍 {item.location}</Text>
      <Text style={styles.status}>Status: {item.status || 'pending'}</Text>
      <View style={styles.buttonRow}>
        <Button title="Pending" onPress={() => updateStatus(item.id, 'pending')} color="#FFA500" />
        <Button title="Active" onPress={() => updateStatus(item.id, 'active')} color="#007AFF" />
        <Button title="Resolved" onPress={() => updateStatus(item.id, 'resolved')} color="#28A745" />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Incident Response Dashboard</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <View style={styles.tabRow}>
            {['pending', 'active', 'resolved'].map((status) => {
              const isActive = statusFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  style={[styles.tabButton, isActive && styles.activeTab]}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.activeTabText]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {filteredReports.length === 0 ? (
            <Text style={styles.emptyText}>
              No reports marked as "{statusFilter}"
            </Text>
          ) : (
            <FlatList
              data={filteredReports}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  issue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  location: {
    marginTop: 4,
    fontSize: 13,
    fontStyle: 'italic',
    color: '#666',
  },
  status: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#444',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
