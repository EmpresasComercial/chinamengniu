import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Team() {
  const navigate = useNavigate();
  const { setIsLoading } = useLoading();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'members' | 'contribution'>('members');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [showLevelPicker, setShowLevelPicker] = useState(false);

  const [members, setMembers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayEarnings: 0,
    totalPeople: 0,
    todayRegistrations: 0
  });

  useEffect(() => {
    if (!user) return;
    async function fetchTeamData() {
      const { data: teamData, error: teamError } = await supabase.rpc('get_my_team');
      const today = new Date().toISOString().split('T')[0];

      if (!teamError && teamData) {
        const team = teamData as any[];

        // Total People
        const totalPeople = team.length;

        // Today registrations
        const todayRegs = team.filter(m => {
          const regDate = m.created_at || m.registration_date;
          return regDate && regDate.startsWith(today);
        }).length;

        setStats(prev => ({ ...prev, totalPeople, todayRegistrations: todayRegs }));
        setMembers(team);
      }

      // Fetch Revenue stats from bonus_transacoes
      const { data: bonusData } = await supabase
        .from('bonus_transacoes')
        .select('valor_recebido, data_transacao')
        .eq('user_id', user.id);

      if (bonusData) {
        const totalRevenue = bonusData.reduce((sum, b) => sum + Number(b.valor_recebido), 0);
        const todayEarnings = bonusData
          .filter(b => b.data_transacao && b.data_transacao.startsWith(today))
          .reduce((sum, b) => sum + Number(b.valor_recebido), 0);

        setStats(prev => ({ ...prev, totalRevenue, todayEarnings }));
      }
    }
    fetchTeamData();
  }, [user]);

  const isContributionTab = activeTab === 'contribution';
  const filteredMembers = members.filter(m => {
    const isCorrectLevel = m.level === selectedLevel;
    if (!isCorrectLevel) return false;

    if (isContributionTab) {
      return Number(m.reloaded_amount) >= 9000;
    }
    return true; // Show all for 'members' tab
  });

  const todayRegsInLevel = members.filter(m => {
    const isCorrectLevel = m.level === selectedLevel;
    const regDate = m.created_at || m.registration_date;
    const isToday = regDate && regDate.startsWith(new Date().toISOString().split('T')[0]);
    return isCorrectLevel && isToday;
  }).length;

  const handleTabChange = (tab: 'members' | 'contribution') => {
    setIsLoading(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#E5E9F2]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0000A0] text-white flex items-center h-12 px-4">
        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-start">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-center font-medium text-[15px] mr-8">minha equipe</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Stats Card */}
        <section className="bg-white rounded-[1.5rem] p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-y-6 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Receita total(Kz)</span>
              <span className="text-[15px] font-bold text-[#0000A0]">{stats.totalRevenue.toLocaleString('pt-AO')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Ganhos de hoje(Kz)</span>
              <span className="text-[15px] font-bold text-[#0000A0]">{stats.todayEarnings.toLocaleString('pt-AO')}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Número total de pessoas</span>
              <span className="text-[15px] font-bold text-[#0000A0]">{stats.totalPeople}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#4A5568] font-medium mb-1">Novos cadastros hoje</span>
              <span className="text-[15px] font-bold text-[#0000A0]">{stats.todayRegistrations}</span>
            </div>
          </div>
        </section>

        {/* Tab Switcher */}
        <nav className="bg-white rounded-full py-3 px-1 flex items-center justify-around shadow-sm text-[12.5px] font-medium">
          <button
            onClick={() => handleTabChange('members')}
            className="flex flex-col items-center focus:outline-none"
          >
            <span className={activeTab === 'members' ? 'text-black' : 'text-gray-500'}>membros da equipe</span>
            {activeTab === 'members' && <div className="w-[30px] h-[3px] bg-[#333] mt-1 rounded-full"></div>}
          </button>
          <div className="h-4 w-[1px] bg-gray-300"></div>
          <button
            onClick={() => handleTabChange('contribution')}
            className="flex flex-col items-center focus:outline-none"
          >
            <span className={activeTab === 'contribution' ? 'text-black' : 'text-gray-500'}>contribuição da equipe</span>
            {activeTab === 'contribution' && <div className="w-[30px] h-[3px] bg-[#333] mt-1 rounded-full"></div>}
          </button>
        </nav>

        {/* List Section (Used by both tabs) */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex justify-between items-center px-1 text-[12.5px]">
            <div className="text-[#4A5568]">
              {activeTab === 'members' ? 'novos cadastros hoje' : 'contribuidores qualificados'}
              <span className="text-[#4A5568] ml-1">
                {activeTab === 'members' ? todayRegsInLevel : filteredMembers.length}
              </span>
            </div>
            <div
              className="flex items-center text-[#4A5568] cursor-pointer relative"
              onClick={() => setShowLevelPicker(!showLevelPicker)}
            >
              nível {selectedLevel}
              <ChevronDown className="h-3 w-3 ml-1" />

              {showLevelPicker && (
                <div className="absolute top-full right-0 mt-2 bg-white shadow-xl rounded-lg py-2 w-24 z-[100] border border-gray-100">
                  {[1, 2, 3].map(lvl => (
                    <div
                      key={lvl}
                      className={`px-4 py-2 hover:bg-gray-50 ${selectedLevel === lvl ? 'text-blue-600 font-bold' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLevel(lvl);
                        setShowLevelPicker(false);
                      }}
                    >
                      Nível {lvl}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* List Container */}
          <div className="space-y-2">
            {/* Table Header */}
            <div className="bg-white rounded-lg py-3 px-4 grid grid-cols-3 text-center text-[12.5px] font-medium text-gray-700 shadow-sm">
              <div>conta</div>
              <div>nota</div>
              <div>{activeTab === 'members' ? 'período' : 'investimento'}</div>
            </div>

            {/* Members List */}
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member, idx) => (
                <div key={idx} className="bg-white rounded-lg py-4 px-4 grid grid-cols-3 text-center text-[11px] text-gray-600 shadow-sm items-center">
                  <div className="font-mono">
                    {member.phone ? `${member.phone.substring(0, 3)}****${member.phone.substring(member.phone.length - 3)}` : '---'}
                  </div>
                  <div>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px]">L{member.level}</span>
                  </div>
                  <div className={activeTab === 'members' ? "text-[10px]" : "text-[10px] font-bold text-blue-700"}>
                    {activeTab === 'members'
                      ? new Date(member.created_at || member.registration_date).toLocaleDateString()
                      : `${Number(member.reloaded_amount).toLocaleString('pt-AO')} Kz`
                    }
                  </div>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="bg-white rounded-[1.5rem] flex flex-col items-center justify-center p-8 shadow-sm min-h-[250px]">
                <div className="relative w-32 h-32 mb-4">
                  <img
                    alt="vazio"
                    className="w-full h-full object-contain opacity-40 text-gray-300"
                    src="https://www.mengniu.wang/assets/empty-image-CHCN_UjN.png"
                  />
                </div>
                <p className="text-gray-400 text-[12.5px]">vazio</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
