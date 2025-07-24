import React, { useState, useEffect } from 'react';
import { Users, Crown, Play, Trophy } from 'lucide-react';
import { useFirestore } from './hooks/useFirestore';

const LotteryApp = () => {
  const [currentUser, setCurrentUser] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [maxUsers, setMaxUsers] = useState(10);

  // Firebase integration
  const { channels, loading, createChannel: createChannelFirestore, updateChannel, useChannelListener } = useFirestore();
  
  // Channel state
  const [users, setUsers] = useState([]);
  const [selectedBoxes, setSelectedBoxes] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Real-time channel listener
  const { channel: currentChannelData } = useChannelListener(selectedChannel?.id);

  // Sync local state with real-time data
  useEffect(() => {
    if (currentChannelData && selectedChannel) {
      setUsers(currentChannelData.users || []);
      setSelectedBoxes(currentChannelData.selectedBoxes || {});
      setResults(currentChannelData.results || []);
      setShowResults(currentChannelData.isDrawn || false);
    }
  }, [currentChannelData, selectedChannel]);

  // Initialize current user
  useEffect(() => {
    if (!currentUser) {
      setCurrentUser(`User_${Math.random().toString(36).substr(2, 6)}`);
    }
  }, [currentUser]);

  const createChannel = async () => {
    if (!channelName.trim()) return;
    
    const newChannel = {
      name: channelName,
      admin: currentUser,
      maxUsers: maxUsers,
      users: [{ id: currentUser, name: userName || currentUser, isAdmin: true }],
      selectedBoxes: {},
      results: [],
      isDrawn: false
    };
    
    try {
      const channelId = await createChannelFirestore(newChannel);
      const createdChannel = { id: channelId, ...newChannel };
      setSelectedChannel(createdChannel);
      setUsers(createdChannel.users);
      setSelectedBoxes({});
      setResults([]);
      setShowResults(false);
      setIsCreatingChannel(false);
      setChannelName('');
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  const joinChannel = async (channel) => {
    const finalUserName = userName || currentUser;
    
    if (channel.users.length >= channel.maxUsers) {
      alert('Channel is full!');
      return;
    }

    if (channel.users.find(u => u.id === currentUser)) {
      // User already in channel, just select it
      setSelectedChannel(channel);
      setUsers(channel.users);
      setSelectedBoxes(channel.selectedBoxes || {});
      setResults(channel.results || []);
      setShowResults(channel.isDrawn || false);
      return;
    }

    const updatedChannel = {
      ...channel,
      users: [...channel.users, { id: currentUser, name: finalUserName, isAdmin: false }]
    };
    
    try {
      await updateChannel(channel.id, { users: updatedChannel.users });
      setSelectedChannel(updatedChannel);
      setUsers(updatedChannel.users);
      setSelectedBoxes(updatedChannel.selectedBoxes || {});
      setResults(updatedChannel.results || []);
      setShowResults(updatedChannel.isDrawn || false);
    } catch (error) {
      console.error('Error joining channel:', error);
      alert('Failed to join channel. Please try again.');
    }
  };

  const selectBox = async (boxIndex) => {
    // Check if the box is already selected by someone else
    if (selectedBoxes[boxIndex] || isDrawing || showResults) return;
    
    // Check if current user has already selected a box
    const userHasSelected = Object.values(selectedBoxes).includes(currentUser);
    if (userHasSelected) return;
    
    const newSelectedBoxes = { ...selectedBoxes, [boxIndex]: currentUser };
    setSelectedBoxes(newSelectedBoxes);
    
    // Update channel data in Firebase
    if (selectedChannel) {
      try {
        await updateChannel(selectedChannel.id, { selectedBoxes: newSelectedBoxes });
        const updatedChannel = { ...selectedChannel, selectedBoxes: newSelectedBoxes };
        setSelectedChannel(updatedChannel);
      } catch (error) {
        console.error('Error selecting box:', error);
        // Revert local state on error
        setSelectedBoxes(selectedBoxes);
      }
    }
  };

  const startDraw = async () => {
    if (!isAdmin() || Object.keys(selectedBoxes).length === 0) return;
    
    setIsDrawing(true);
    
    setTimeout(async () => {
      const selectedBoxNumbers = Object.keys(selectedBoxes);
      const shuffledNumbers = [...selectedBoxNumbers].sort(() => Math.random() - 0.5);
      
      const drawResults = shuffledNumbers.map((boxIndex, position) => ({
        position: position + 1,
        boxIndex: parseInt(boxIndex),
        userId: selectedBoxes[boxIndex],
        userName: users.find(u => u.id === selectedBoxes[boxIndex])?.name || 'Unknown'
      }));
      
      setResults(drawResults);
      setShowResults(true);
      setIsDrawing(false);
      
      // Update channel data in Firebase
      if (selectedChannel) {
        try {
          await updateChannel(selectedChannel.id, { 
            results: drawResults, 
            isDrawn: true 
          });
          const updatedChannel = { 
            ...selectedChannel, 
            results: drawResults, 
            isDrawn: true 
          };
          setSelectedChannel(updatedChannel);
        } catch (error) {
          console.error('Error updating draw results:', error);
        }
      }
    }, 3000);
  };

  const isAdmin = () => {
    return selectedChannel && selectedChannel.admin === currentUser;
  };

  const resetChannel = async () => {
    if (!isAdmin()) return;
    
    setSelectedBoxes({});
    setResults([]);
    setShowResults(false);
    
    if (selectedChannel) {
      try {
        await updateChannel(selectedChannel.id, { 
          selectedBoxes: {}, 
          results: [], 
          isDrawn: false 
        });
        const updatedChannel = { 
          ...selectedChannel, 
          selectedBoxes: {}, 
          results: [], 
          isDrawn: false 
        };
        setSelectedChannel(updatedChannel);
      } catch (error) {
        console.error('Error resetting channel:', error);
      }
    }
  };

  const leaveChannel = () => {
    setSelectedChannel(null);
    setUsers([]);
    setSelectedBoxes({});
    setResults([]);
    setShowResults(false);
  };

  if (!selectedChannel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">
            🎲 Lottery Channels
          </h1>
          
          {/* User Name Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Your Name</h2>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={`Enter your name (default: ${currentUser})`}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Create Channel */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Channel</h2>
            {!isCreatingChannel ? (
              <button
                onClick={() => setIsCreatingChannel(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Create Channel
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div>
                  <label className="block text-white mb-2">Max Users: {maxUsers}</label>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={createChannel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsCreatingChannel(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Available Channels */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Available Channels ({channels.length})
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                <span className="ml-2 text-white">Loading channels...</span>
              </div>
            ) : channels.length === 0 ? (
              <p className="text-gray-300">No channels available. Create one to get started!</p>
            ) : (
              <div className="grid gap-3">
                {channels.map(channel => (
                  <div key={channel.id} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{channel.name}</h3>
                      <p className="text-gray-300 text-sm">
                        {channel.users.length}/{channel.maxUsers} users
                        {channel.admin === currentUser && <span className="ml-2 text-yellow-400">👑 Your channel</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => joinChannel(channel)}
                      disabled={channel.users.length >= channel.maxUsers && !channel.users.find(u => u.id === currentUser)}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {channel.users.find(u => u.id === currentUser) ? 'Enter' : 
                       channel.users.length >= channel.maxUsers ? 'Full' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              🎲 {selectedChannel.name}
              {isAdmin() && <Crown className="w-5 h-5 text-yellow-400" />}
            </h1>
            <p className="text-gray-300">
              {users.length}/{selectedChannel.maxUsers} users
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin() && !showResults && (
              <>
                <button
                  onClick={startDraw}
                  disabled={Object.keys(selectedBoxes).length === 0 || isDrawing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {isDrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Drawing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start Draw
                    </>
                  )}
                </button>
                <button
                  onClick={resetChannel}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Reset
                </button>
              </>
            )}
            <button
              onClick={leaveChannel}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Users List */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users ({users.length})
            </h2>
            <div className="space-y-2">
              {users.map(user => (
                <div
                  key={user.id}
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    user.id === currentUser ? 'bg-purple-600/50' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    Object.values(selectedBoxes).includes(user.id) ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-white text-sm">
                    {user.name}
                    {user.isAdmin && <Crown className="w-3 h-3 text-yellow-400 inline ml-1" />}
                    {user.id === currentUser && <span className="text-purple-300"> (You)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lottery Boxes */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Lottery Boxes ({Object.keys(selectedBoxes).length}/{selectedChannel.maxUsers} selected)
            </h2>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: selectedChannel.maxUsers }, (_, index) => {
                const isSelected = selectedBoxes[index] !== undefined;
                const isMySelection = selectedBoxes[index] === currentUser;
                const selectedUserName = isSelected ? users.find(u => u.id === selectedBoxes[index])?.name : '';
                const resultNumber = results.find(r => r.boxIndex === index)?.position;

                return (
                  <button
                    key={index}
                    onClick={() => selectBox(index)}
                    disabled={isSelected || isDrawing || showResults}
                    className={`
                      aspect-square rounded-lg font-bold text-sm transition-all duration-300 relative overflow-hidden
                      ${isMySelection ? 'bg-purple-600 text-white shadow-lg transform scale-105' : 
                        isSelected ? 'bg-blue-600 text-white' : 
                        'bg-white/20 text-white hover:bg-white/30'}
                      ${!isSelected && !isDrawing && !showResults ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    `}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                      {showResults && resultNumber && (
                        <div className="text-2xl font-bold text-yellow-400 mb-1">
                          #{resultNumber}
                        </div>
                      )}
                      {isSelected && (
                        <div className="text-xs text-center leading-tight">
                          {selectedUserName}
                        </div>
                      )}
                      {!isSelected && !showResults && (
                        <div className="text-lg opacity-50">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    {isDrawing && isSelected && (
                      <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Results
            </h2>
            {!showResults ? (
              <p className="text-gray-300 text-sm">
                {Object.keys(selectedBoxes).length === 0 
                  ? 'Select boxes to participate'
                  : 'Waiting for draw to start...'}
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.boxIndex}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      index === 0 ? 'bg-yellow-600/30 border border-yellow-400' :
                      index === 1 ? 'bg-gray-600/30 border border-gray-400' :
                      index === 2 ? 'bg-orange-600/30 border border-orange-400' :
                      'bg-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-400 text-black' :
                      'bg-blue-600 text-white'
                    }`}>
                      {result.position}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">
                        {result.userName}
                      </div>
                      <div className="text-gray-300 text-xs">
                        Box #{result.boxIndex + 1}
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="ml-auto">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotteryApp;