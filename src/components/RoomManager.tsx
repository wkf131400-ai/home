import React, { useState } from 'react';
import { Plus, Sparkles, Layers, ArrowLeft, ArrowRight, RotateCcw, Home, PlusCircle } from 'lucide-react';
import { RoomItem, RoomScheme, LayoutPreset } from '../types';
import { RoomConfigCard } from './RoomConfigCard';
import { createDefaultRoom, getCategoryFromName } from '../utils/calculator';
import { LAYOUT_PRESETS } from '../data/presetData';

interface RoomManagerProps {
  rooms: RoomItem[];
  onUpdateRoomScheme: (roomId: string, newScheme: RoomScheme) => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onAddRoom: (newRoom: RoomItem) => void;
  onSelectPresetLayout: (preset: LayoutPreset) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  totalCostTenThousand: number;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  rooms,
  onUpdateRoomScheme,
  onRenameRoom,
  onDeleteRoom,
  onAddRoom,
  onSelectPresetLayout,
  onPrevStep,
  onNextStep,
  totalCostTenThousand,
}) => {
  const [expandedRoomIds, setExpandedRoomIds] = useState<Record<string, boolean>>(() => {
    // Default expand first room
    const init: Record<string, boolean> = {};
    if (rooms[0]) init[rooms[0].id] = true;
    return init;
  });

  const [newRoomName, setNewRoomName] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleExpand = (roomId: string) => {
    setExpandedRoomIds((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    rooms.forEach((r) => (all[r.id] = true));
    setExpandedRoomIds(all);
  };

  const handleCollapseAll = () => {
    setExpandedRoomIds({});
  };

  const handleCreateNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const name = newRoomName.trim();
    const category = getCategoryFromName(name);
    const newRoom = createDefaultRoom(name, category);

    onAddRoom(newRoom);
    setExpandedRoomIds((prev) => ({ ...prev, [newRoom.id]: true }));
    setNewRoomName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
        <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
          <Layers className="w-4 h-4 text-slate-700" />
          <span>房间设备配置 ({rooms.length}个房间)</span>
        </div>

        <div className="flex items-center space-x-2.5 text-[11px]">
          <button onClick={handleExpandAll} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">
            展开全部
          </button>
          <span className="text-slate-300">|</span>
          <button onClick={handleCollapseAll} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer">
            折叠全部
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-2xs cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加房间</span>
          </button>
        </div>
      </div>

      {/* Room Cards List */}
      <div className="space-y-3">
        {rooms.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
            <p className="text-slate-500 text-xs">当前未添加任何房间，请点击下方按钮添加房间</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-2xs cursor-pointer"
            >
              + 手动添加房间
            </button>
          </div>
        ) : (
          rooms.map((room) => (
            <RoomConfigCard
              key={room.id}
              room={room}
              onUpdateRoomScheme={onUpdateRoomScheme}
              onRenameRoom={onRenameRoom}
              onDeleteRoom={onDeleteRoom}
              isExpanded={!!expandedRoomIds[room.id]}
              onToggleExpand={() => toggleExpand(room.id)}
            />
          ))
        )}
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-slate-800" />
              <span>添加自定义房间</span>
            </h3>

            <form onSubmit={handleCreateNewRoom} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  房间名称 (手输)
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="例如: 儿童房、电竞房、阁楼..."
                  className="w-full bg-white border border-slate-300 focus:border-slate-900 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Step Navigation Bar */}
      <div className="flex flex-col space-y-2 pt-3 border-t border-slate-200">
        <button
          onClick={onNextStep}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-xs cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI智能生成</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
        </button>

        <button
          onClick={onPrevStep}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回修改户型与预算</span>
        </button>
      </div>
    </div>
  );
};
