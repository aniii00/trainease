
import { 
  Timer,
  Activity,
  Award,
  Trophy,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Filter,
  Search,
  ChevronRight,
  LogIn,
  LogOut,
  Settings,
  Home,
  List,
  Grid,
  PlusCircle,
  Trash,
  Edit,
  Check,
  X,
  ArrowLeft,
  BarChart, 
  IndianRupee,
  Waves,
  ShieldCheck
} from "lucide-react";

// Map sport names to icons
export const getSportIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    swim: <Timer className="h-6 w-6" />,
    tennis: <Activity className="h-6 w-6" />,
    football: <Award className="h-6 w-6" />,
    basketball: <Trophy className="h-6 w-6" />,
    cricket: <BarChart className="h-6 w-6" />, // Using BarChart as a substitute for cricket
    badminton: <Activity className="h-6 w-6" /> // Using Activity as a substitute for badminton
  };

  return iconMap[iconName.toLowerCase()] || <Sport className="h-6 w-6" />;
};

// Additional icons for UI
export const Sport = (props: any) => <BarChart {...props} />;
export const LocationIcon = (props: any) => <MapPin {...props} />;
export const CalendarIcon = (props: any) => <Calendar {...props} />;
export const TimeIcon = (props: any) => <Clock {...props} />;
export const PriceIcon = (props: any) => <IndianRupee {...props} />;
export const UserIcon = (props: any) => <User {...props} />;
export const PhoneIcon = (props: any) => <Phone {...props} />;
export const FilterIcon = (props: any) => <Filter {...props} />;
export const SearchIcon = (props: any) => <Search {...props} />;
export const ArrowRightIcon = (props: any) => <ChevronRight {...props} />;
export const LoginIcon = (props: any) => <LogIn {...props} />;
export const LogoutIcon = (props: any) => <LogOut {...props} />;
export const SettingsIcon = (props: any) => <Settings {...props} />;
export const HomeIcon = (props: any) => <Home {...props} />;
export const ListIcon = (props: any) => <List {...props} />;
export const GridIcon = (props: any) => <Grid {...props} />;
export const AddIcon = (props: any) => <PlusCircle {...props} />;
export const DeleteIcon = (props: any) => <Trash {...props} />;
export const EditIcon = (props: any) => <Edit {...props} />;
export const CheckIcon = (props: any) => <Check {...props} />;
export const CloseIcon = (props: any) => <X {...props} />;
export const BackIcon = (props: any) => <ArrowLeft {...props} />;
export const ChartIcon = (props: any) => <BarChart {...props} />;
export const WavesIcon = (props: any) => <Waves {...props} />;
export const ShieldIcon = (props: any) => <ShieldCheck {...props} />;
