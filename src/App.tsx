/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Plus, 
  Minus,
  Search, 
  AlertTriangle,
  FileText,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Menu,
  ChevronRight,
  User as UserIcon,
  Printer,
  ArrowLeft,
  Eye,
  Truck,
  History,
  Users2,
  ArrowLeftRight,
  Database,
  MinusCircle,
  CreditCard,
  Mail,
  Calculator,
  Check,
  ChevronsUpDown,
  Barcode,
  Camera
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc,
  setDoc,
  query, 
  orderBy, 
  limit, 
  Timestamp,
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Toaster, toast } from 'sonner';

import { 
  db, 
  auth, 
  googleProvider, 
  handleFirestoreError, 
  OperationType,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '@/lib/firebase';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
const secondaryAuth = getAuth(secondaryApp);
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

// --- Types ---

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  expiryDate?: string;
  manufacturer?: string;
  barcode?: string;
}

interface SaleItem {
  medicineId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
  amountPaid: number;
  dueAmount: number;
  timestamp: any;
  sellerId: string;
}

interface PurchaseItem {
  medicineId: string;
  name: string;
  quantity: number;
  cost: number;
  subtotal: number;
}

interface Purchase {
  id: string;
  items: PurchaseItem[];
  totalCost: number;
  supplierName?: string;
  timestamp: any;
  recordedBy: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number;
  createdAt: any;
}

interface CustomerPayment {
  id: string;
  customerId: string;
  customerPhone: string;
  amount: number;
  timestamp: any;
  method: string;
  note?: string;
}

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  note: string;
  timestamp: any;
  recordedBy: string;
}

interface StockAdjustment {
  id: string;
  medicineId: string;
  medicineName: string;
  type: 'addition' | 'subtraction';
  quantity: number;
  reason: string;
  timestamp: any;
  recordedBy: string;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-primary text-primary-foreground shadow-md' 
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
  </button>
);

const NavigationContent = ({ activeTab, setActiveTab, profile, user, handleLogout }: any) => (
  <div className="flex flex-col h-full">
    <div className="p-6 flex items-center gap-3 border-b md:hidden">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <ShoppingCart className="w-5 h-5 text-white" />
      </div>
      <h1 className="text-xl font-bold tracking-tight">PharmaFlow</h1>
    </div>
    
    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      <SidebarItem icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
      
      <div className="pt-4 pb-2 px-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Sales</div>
      <SidebarItem icon={ShoppingCart} label="Sell" active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} />
      <SidebarItem icon={Users} label="Contacts" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
      <SidebarItem icon={CreditCard} label="Payment Accounts" active={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
      <SidebarItem icon={Calculator} label="Accounting" active={activeTab === 'accounting'} onClick={() => setActiveTab('accounting')} />
      <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />

      <div className="pt-4 pb-2 px-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Purchases & Stock</div>
      <SidebarItem icon={Truck} label="Purchases" active={activeTab === 'purchases'} onClick={() => setActiveTab('purchases')} />
      <SidebarItem icon={Package} label="Products" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
      <SidebarItem icon={ArrowLeftRight} label="Stock Transfers" active={activeTab === 'transfers'} onClick={() => setActiveTab('transfers')} />
      <SidebarItem icon={Database} label="Stock Adjustment" active={activeTab === 'adjustments'} onClick={() => setActiveTab('adjustments')} />
      <SidebarItem icon={MinusCircle} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />

      <div className="pt-4 pb-2 px-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Settings</div>
      {profile?.role === 'admin' && (
        <SidebarItem icon={Users2} label="User Management" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
      )}
      <SidebarItem icon={Mail} label="Notification Templates" active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
      {profile?.role === 'admin' && (
        <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      )}
    </nav>

    <div className="p-4 border-t space-y-4">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
          {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{user.displayName}</p>
          <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'Staff'}</p>
        </div>
      </div>
      <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
        <LogOut className="w-5 h-5 mr-3" /> Sign Out
      </Button>
    </div>
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string, value: string | number, icon: any, trend?: string, color: string }) => (
  <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {trend && (
            <p className={`text-xs mt-1 ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const BarcodeScanner = ({ onScan, onClose }: { onScan: (data: string) => void, onClose: () => void }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear();
        onClose();
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Scan Barcode</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div id="reader" className="w-full overflow-hidden rounded-lg border bg-muted"></div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Position the barcode within the frame to scan automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data States
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low'>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>([]);
  const [pharmacyInfo, setPharmacyInfo] = useState<any>(null);

  // Stock Adjustment State
  const [adjMedicineId, setAdjMedicineId] = useState("");
  const [adjOpen, setAdjOpen] = useState(false);

  // UI States for Dialogs
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Sales History Filters
  const [salesFilterDate, setSalesFilterDate] = useState('');
  const [salesFilterPayment, setSalesFilterPayment] = useState('All');
  const [salesFilterSeller, setSalesFilterSeller] = useState('All');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isEmailLogin, setIsEmailLogin] = useState(false);

  // POS State
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [posDiscount, setPosDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customerPhone, setCustomerPhone] = useState('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [lastSale, setLastSale] = useState<any | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<{ amount: number, customerName: string } | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Purchase State
  const [purchaseCart, setPurchaseCart] = useState<PurchaseItem[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [purchaseSearchQuery, setPurchaseSearchQuery] = useState('');

  const printInvoice = (sale: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = sale.items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.subtotal.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - PharmaFlow</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-info { margin-bottom: 20px; display: flex; justify-content: space-between; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .totals { text-align: right; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${pharmacyInfo?.name || 'PharmaFlow'}</h1>
            ${pharmacyInfo?.address ? `<p>${pharmacyInfo.address}</p>` : '<p>Pharmacy Management System</p>'}
            ${pharmacyInfo?.phone ? `<p>Phone: ${pharmacyInfo.phone}</p>` : ''}
          </div>
          <div class="invoice-info">
            <div>
              <p><strong>Date:</strong> ${format(new Date(), 'PPP p')}</p>
              <p><strong>Customer:</strong> ${sale.customerPhone || 'Walk-in'}</p>
            </div>
            <div>
              <p><strong>Invoice #:</strong> ${sale.id || 'Draft'}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 8px; text-align: left;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: $${sale.totalAmount.toFixed(2)}</p>
            <p>Discount: $${sale.discount.toFixed(2)}</p>
            <h2 style="color: #000; margin-bottom: 5px;">Total: $${sale.finalAmount.toFixed(2)}</h2>
            <p><strong>Payment Method:</strong> ${sale.paymentMethod}</p>
            <p><strong>Amount Paid:</strong> $${(sale.amountPaid || sale.finalAmount).toFixed(2)}</p>
            ${sale.dueAmount > 0 ? `<p style="color: red;"><strong>Due Amount:</strong> $${sale.dueAmount.toFixed(2)}</p>` : ''}
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const userDocRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (!userSnap.exists()) {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              name: u.displayName || 'User',
              role: u.email === 'op.jobayer@gmail.com' ? 'admin' : 'staff'
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            setProfile(userSnap.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubMedicines = onSnapshot(collection(db, 'medicines'), (snapshot) => {
      setMedicines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Medicine)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'medicines'));

    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'sales'));

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'customers'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const unsubPayments = onSnapshot(collection(db, 'customerPayments'), (snapshot) => {
      setCustomerPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerPayment)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'customerPayments'));

    const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      setPurchases(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'purchases'));

    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));

    const unsubStockAdjustments = onSnapshot(query(collection(db, 'stockAdjustments'), orderBy('timestamp', 'desc'), limit(100)), (snapshot) => {
      setStockAdjustments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StockAdjustment)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'stockAdjustments'));

    const unsubPharmacyInfo = onSnapshot(doc(db, 'pharmacyInfo', 'main'), (snapshot) => {
      if (snapshot.exists()) {
        setPharmacyInfo(snapshot.data());
      }
    });

    return () => {
      unsubMedicines();
      unsubSales();
      unsubCustomers();
      unsubUsers();
      unsubPayments();
      unsubPurchases();
      unsubExpenses();
      unsubStockAdjustments();
      unsubPharmacyInfo();
    };
  }, [user]);

  const savePharmacyInfo = async (data: any) => {
    try {
      await setDoc(doc(db, 'pharmacyInfo', 'main'), data);
      toast.success("Pharmacy information updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'pharmacyInfo/main');
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error("Login failed");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      toast.success("Logged in successfully");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // --- Inventory Actions ---
  const addMedicine = async (data: any) => {
    try {
      await addDoc(collection(db, 'medicines'), {
        ...data,
        stock: Number(data.stock) || 0,
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        lowStockThreshold: Number(data.lowStockThreshold) || 10
      });
      toast.success("Medicine added successfully");
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'medicines');
      return false;
    }
  };

  const deleteMedicine = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;
    try {
      await deleteDoc(doc(db, 'medicines', id));
      toast.success("Medicine deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'medicines');
    }
  };

  const updateMedicine = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'medicines', id), {
        ...data,
        stock: Number(data.stock) || 0,
        price: Number(data.price) || 0,
        cost: Number(data.cost) || 0,
        lowStockThreshold: Number(data.lowStockThreshold) || 10
      });
      toast.success("Medicine updated successfully");
      setEditingMedicine(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `medicines/${id}`);
    }
  };

  const addExpense = async (data: any) => {
    try {
      await addDoc(collection(db, 'expenses'), {
        ...data,
        amount: Number(data.amount),
        timestamp: serverTimestamp(),
        recordedBy: user?.uid
      });
      toast.success("Expense recorded");
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses');
      return false;
    }
  };

  const adjustStock = async (data: any) => {
    try {
      const med = medicines.find(m => m.id === data.medicineId);
      if (!med) return false;

      const qty = Number(data.quantity);
      const newStock = data.type === 'addition' ? med.stock + qty : med.stock - qty;

      if (newStock < 0) {
        toast.error("Stock cannot be negative");
        return false;
      }

      await addDoc(collection(db, 'stockAdjustments'), {
        ...data,
        medicineName: med.name,
        quantity: qty,
        timestamp: serverTimestamp(),
        recordedBy: user?.uid
      });

      await updateDoc(doc(db, 'medicines', med.id), {
        stock: newStock
      });

      toast.success("Stock adjusted successfully");
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'stockAdjustments');
      return false;
    }
  };

  const handleBarcodeScan = (barcode: string) => {
    const med = medicines.find(m => m.barcode === barcode);
    if (med) {
      addToCart(med);
      toast.success(`Added ${med.name} to cart`, {
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        duration: 2000
      });
    } else {
      toast.error(`No medicine found with barcode: ${barcode}`);
    }
  };

  // --- POS Actions ---
  const addToCart = (med: Medicine) => {
    if (med.stock <= 0) {
      toast.error("Out of stock");
      return;
    }
    const existing = cart.find(item => item.medicineId === med.id);
    if (existing) {
      if (existing.quantity >= med.stock) {
        toast.error("Cannot exceed available stock");
        return;
      }
      setCart(cart.map(item => 
        item.medicineId === med.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price } 
          : item
      ));
    } else {
      setCart([...cart, {
        medicineId: med.id,
        name: med.name,
        quantity: 1,
        price: med.price,
        subtotal: med.price
      }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.medicineId !== id));
  };

  const updateCartQuantity = (id: string, qty: number) => {
    const med = medicines.find(m => m.id === id);
    if (!med) return;
    if (qty > med.stock) {
      toast.error("Cannot exceed available stock");
      return;
    }
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.medicineId === id 
        ? { ...item, quantity: qty, subtotal: qty * item.price } 
        : item
    ));
  };

  const totalCartAmount = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const finalCartAmount = Math.max(0, totalCartAmount - posDiscount);
  const currentAmountPaid = amountPaid === '' ? finalCartAmount : Number(amountPaid);
  const dueAmount = Math.max(0, finalCartAmount - currentAmountPaid);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (dueAmount > 0 && !customerPhone) {
      toast.error("Customer phone is required for due payments");
      return;
    }
    try {
      const saleData = {
        items: cart,
        totalAmount: totalCartAmount,
        discount: posDiscount,
        finalAmount: finalCartAmount,
        amountPaid: currentAmountPaid,
        dueAmount: dueAmount,
        paymentMethod,
        customerPhone,
        timestamp: serverTimestamp(),
        sellerId: user?.uid
      };
      
      const docRef = await addDoc(collection(db, 'sales'), saleData);
      
      // Register customer if phone provided and not already registered
      if (customerPhone) {
        const existingCustomer = customers.find(c => c.phone === customerPhone);
        if (!existingCustomer) {
          try {
            await addDoc(collection(db, 'customers'), {
              name: `Customer ${customerPhone.slice(-4)}`,
              phone: customerPhone,
              totalPurchases: 1,
              lastPurchase: serverTimestamp(),
              createdAt: serverTimestamp(),
              balance: dueAmount
            });
          } catch (err) {
            console.error("Error auto-registering customer:", err);
          }
        } else {
          // Update existing customer stats
          try {
            await updateDoc(doc(db, 'customers', existingCustomer.id), {
              totalPurchases: (existingCustomer.totalPurchases || 0) + 1,
              lastPurchase: serverTimestamp(),
              balance: (existingCustomer.balance || 0) + dueAmount
            });
          } catch (err) {
            console.error("Error updating customer stats:", err);
          }
        }
      }
      
      // Update stock
      for (const item of cart) {
        const med = medicines.find(m => m.id === item.medicineId);
        if (med) {
          await updateDoc(doc(db, 'medicines', med.id), {
            stock: med.stock - item.quantity
          });
        }
      }
      
      const saleWithId = { ...saleData, id: docRef.id };
      setLastSale(saleWithId);
      setCart([]);
      setPosDiscount(0);
      setCustomerPhone('');
      setAmountPaid('');
      toast.success("Sale completed successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sales');
    }
  };

  // --- Purchase Actions ---
  const addToPurchaseCart = (med: Medicine) => {
    const existing = purchaseCart.find(item => item.medicineId === med.id);
    if (existing) {
      setPurchaseCart(purchaseCart.map(item => 
        item.medicineId === med.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.cost } 
          : item
      ));
    } else {
      setPurchaseCart([...purchaseCart, {
        medicineId: med.id,
        name: med.name,
        quantity: 1,
        cost: med.cost,
        subtotal: med.cost
      }]);
    }
  };

  const removeFromPurchaseCart = (id: string) => {
    setPurchaseCart(purchaseCart.filter(item => item.medicineId !== id));
  };

  const updatePurchaseQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromPurchaseCart(id);
      return;
    }
    setPurchaseCart(purchaseCart.map(item => 
      item.medicineId === id 
        ? { ...item, quantity: qty, subtotal: qty * item.cost } 
        : item
    ));
  };

  const totalPurchaseAmount = purchaseCart.reduce((sum, item) => sum + item.subtotal, 0);

  const handlePurchaseCheckout = async () => {
    if (purchaseCart.length === 0) return;
    try {
      const purchaseData = {
        items: purchaseCart,
        totalCost: totalPurchaseAmount,
        supplierName,
        timestamp: serverTimestamp(),
        recordedBy: user?.uid
      };
      
      await addDoc(collection(db, 'purchases'), purchaseData);
      
      // Update stock
      for (const item of purchaseCart) {
        const med = medicines.find(m => m.id === item.medicineId);
        if (med) {
          await updateDoc(doc(db, 'medicines', med.id), {
            stock: med.stock + item.quantity
          });
        }
      }
      
      setPurchaseCart([]);
      setSupplierName('');
      toast.success("Purchase recorded and stock updated");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'purchases');
    }
  };

  // --- Analytics ---
  const dashboardStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = sales.filter(s => {
      const date = s.timestamp?.toDate();
      return date && date >= today;
    });

    const totalRevenue = todaySales.reduce((sum, s) => sum + s.finalAmount, 0);
    const lowStockCount = medicines.filter(m => m.stock <= m.lowStockThreshold).length;
    const totalMedicines = medicines.length;

    return { totalRevenue, lowStockCount, totalMedicines, todaySalesCount: todaySales.length };
  }, [sales, medicines]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return format(d, 'MMM dd');
    }).reverse();

    return last7Days.map(day => {
      const daySales = sales.filter(s => {
        const date = s.timestamp?.toDate();
        return date && format(date, 'MMM dd') === day;
      });
      return {
        name: day,
        sales: daySales.reduce((sum, s) => sum + s.finalAmount, 0)
      };
    });
  }, [sales]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full shadow-2xl border-none">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">PharmaFlow</CardTitle>
            <CardDescription className="text-lg mt-2">Pharmacy Management System</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEmailLogin ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    placeholder="admin@example.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11">Sign In</Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setIsEmailLogin(false)}
                >
                  Back to Google Sign In
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-muted-foreground text-sm">
                  Securely manage your pharmacy inventory, sales, and reports.
                </p>
                <Button onClick={handleLogin} className="w-full h-12 text-lg font-medium" size="lg">
                  Sign in with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEmailLogin(true)} 
                  className="w-full h-12"
                >
                  Sign in with Email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <Toaster position="top-right" richColors />
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">PharmaFlow</h1>
          </div>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon"><Menu className="w-6 h-6" /></Button>} />
            <SheetContent side="left" className="p-0 w-72">
              <NavigationContent 
                activeTab={activeTab} 
                setActiveTab={(tab: string) => {
                  setActiveTab(tab);
                }} 
                profile={profile} 
                user={user} 
                handleLogout={handleLogout} 
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Sidebar (Desktop) */}
        <aside className="w-64 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen">
          <div className="p-6 flex items-center gap-3 border-b">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PharmaFlow</h1>
          </div>
          <NavigationContent 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            profile={profile} 
            user={user} 
            handleLogout={handleLogout} 
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                      <p className="text-muted-foreground">Welcome back, {user.displayName?.split(' ')[0]}</p>
                    </div>
                    <Badge variant="outline" className="px-3 py-1">{format(new Date(), 'EEEE, MMMM do')}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Today's Revenue" value={`$${dashboardStats.totalRevenue.toFixed(2)}`} icon={TrendingUp} color="bg-green-100 text-green-600" />
                    <StatCard title="Total Medicines" value={dashboardStats.totalMedicines} icon={Package} color="bg-blue-100 text-blue-600" />
                    <StatCard title="Low Stock Alerts" value={dashboardStats.lowStockCount} icon={AlertTriangle} color="bg-amber-100 text-amber-600" />
                    <StatCard title="Today's Sales" value={dashboardStats.todaySalesCount} icon={ShoppingCart} color="bg-purple-100 text-purple-600" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 shadow-sm border-none">
                      <CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-none">
                      <CardHeader><CardTitle>Low Stock Alerts</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {medicines.filter(m => m.stock <= m.lowStockThreshold).slice(0, 5).map(med => (
                            <div key={med.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
                              <div><p className="font-semibold text-sm">{med.name}</p></div>
                              <div className="text-right"><p className="text-sm font-bold text-amber-700">{med.stock} left</p></div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'pos' && (
                <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)]">
                  {/* Mobile POS Toggle */}
                  <div className="flex lg:hidden mb-4 bg-muted p-1 rounded-lg shrink-0">
                    <Button 
                      variant={!showCart ? "default" : "ghost"} 
                      className="flex-1" 
                      onClick={() => setShowCart(false)}
                    >
                      Products
                    </Button>
                    <Button 
                      variant={showCart ? "default" : "ghost"} 
                      className="flex-1 relative" 
                      onClick={() => setShowCart(true)}
                    >
                      Cart
                      {cart.length > 0 && (
                        <Badge className="absolute -top-2 -right-2 px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                          {cart.length}
                        </Badge>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                    <div className={cn("lg:col-span-2 flex flex-col space-y-4 min-h-0", showCart ? "hidden lg:flex" : "flex")}>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search medicine..." className="pl-10 h-12" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                      </div>
                      <Button 
                        variant="outline" 
                        className="h-12 px-6 gap-2"
                        onClick={() => setIsScannerOpen(true)}
                      >
                        <Barcode className="w-5 h-5" />
                        <span className="hidden sm:inline">Scan</span>
                      </Button>
                    </div>
                      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start pb-4">
                        {medicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map(med => (
                          <Card key={med.id} className="cursor-pointer hover:border-primary" onClick={() => addToCart(med)}>
                            <CardContent className="p-4">
                              <h4 className="font-bold">{med.name}</h4>
                              <p className="text-primary font-bold">${med.price.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">Stock: {med.stock}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    <Card className={cn("flex flex-col shadow-lg border-none min-h-0", !showCart ? "hidden lg:flex" : "flex")}>
                      <CardHeader className="border-b shrink-0"><CardTitle>Order</CardTitle></CardHeader>
                      <CardContent className="flex-1 overflow-y-auto p-0">
                        <div className="overflow-x-auto">
                          <Table>
                        <TableBody>
                          {cart.map(item => (
                            <TableRow key={item.medicineId}>
                              <TableCell className="text-sm font-medium">{item.name}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="icon-xs" 
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <Input 
                                    type="number"
                                    className="w-12 h-7 text-center text-sm font-bold p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={item.quantity}
                                    onChange={(e) => updateCartQuantity(item.medicineId, parseInt(e.target.value) || 0)}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="icon-xs" 
                                    className="h-6 w-6 rounded-full"
                                    onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                                  >
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-bold text-primary">${item.subtotal.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                      <div className="p-4 md:p-6 border-t bg-muted/30 space-y-4 shrink-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Customer Phone</Label>
                          <Input 
                            placeholder="Phone..." 
                            className="h-9"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Payment Method</Label>
                          <div className="flex gap-1">
                            {['Cash', 'Card', 'Mobile'].map((method) => (
                              <Button
                                key={method}
                                variant={paymentMethod === method ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1 h-9 text-xs px-1"
                                onClick={() => setPaymentMethod(method)}
                              >
                                {method}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">Amount Paid</Label>
                          <Input 
                            type="number"
                            placeholder={finalCartAmount.toFixed(2)}
                            className="h-9"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Due Amount</Label>
                          <div className="h-9 flex items-center px-3 bg-muted rounded-md text-sm font-bold text-red-600">
                            ${dueAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>Subtotal</span>
                          <span>${totalCartAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold">
                          <span>Total</span>
                          <span>${finalCartAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full h-12 text-lg" disabled={cart.length === 0} onClick={handleCheckout}>
                        Checkout & Print
                      </Button>
                    </div>
                  </Card>
                </div>

                <Dialog open={!!paymentSuccess} onOpenChange={(open) => !open && setPaymentSuccess(null)}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                          Payment Received
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-primary">${paymentSuccess?.amount.toFixed(2)}</p>
                          <p className="text-muted-foreground text-sm">Payment successfully recorded for {paymentSuccess?.customerName}</p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="w-full" onClick={() => setPaymentSuccess(null)}>Close</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={!!lastSale} onOpenChange={(open) => !open && setLastSale(null)}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                          Sale Completed
                        </DialogTitle>
                      </DialogHeader>
                      <div className="py-6 text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-bold text-primary">${lastSale?.finalAmount.toFixed(2)}</p>
                          <div className="flex justify-center gap-4 text-sm">
                            <span className="text-green-600 font-medium">Paid: ${lastSale?.amountPaid.toFixed(2)}</span>
                            {lastSale?.dueAmount > 0 && (
                              <span className="text-red-600 font-medium">Due: ${lastSale?.dueAmount.toFixed(2)}</span>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs mt-2">Transaction successful via {lastSale?.paymentMethod}</p>
                        </div>
                      </div>
                      <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => {
                          printInvoice(lastSale);
                          setLastSale(null);
                        }}>
                          <Printer className="w-4 h-4 mr-2" /> Print Invoice
                        </Button>
                        <Button className="flex-1" onClick={() => setLastSale(null)}>
                          New Sale
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {activeTab === 'purchases' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="new">
                      <TabsList>
                        <TabsTrigger value="new">New Purchase</TabsTrigger>
                        <TabsTrigger value="history">Purchase History</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="new" className="space-y-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search medicine to purchase..." 
                            className="pl-10 h-12 text-lg" 
                            value={purchaseSearchQuery}
                            onChange={(e) => setPurchaseSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {medicines
                            .filter(m => 
                              m.name.toLowerCase().includes(purchaseSearchQuery.toLowerCase()) || 
                              m.genericName?.toLowerCase().includes(purchaseSearchQuery.toLowerCase())
                            )
                            .slice(0, 6)
                            .map(med => (
                              <Card key={med.id} className="cursor-pointer hover:border-primary transition-colors" onClick={() => addToPurchaseCart(med)}>
                                <CardContent className="p-4 flex justify-between items-center">
                                  <div>
                                    <p className="font-bold">{med.name}</p>
                                    <p className="text-xs text-muted-foreground">Stock: {med.stock} | Cost: ${med.cost.toFixed(2)}</p>
                                  </div>
                                  <Plus className="w-5 h-5 text-primary" />
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="history">
                        <Card className="p-0 border-none shadow-sm">
                          <div className="overflow-x-auto">
                            <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead className="text-right">Total Cost</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {purchases.map(p => (
                                <TableRow key={p.id}>
                                  <TableCell className="text-sm">
                                    {p.timestamp ? format(p.timestamp.toDate(), 'MMM dd, HH:mm') : '...'}
                                  </TableCell>
                                  <TableCell>{p.supplierName || 'N/A'}</TableCell>
                                  <TableCell>{p.items.length} items</TableCell>
                                  <TableCell className="text-right font-bold">${p.totalCost.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </Card>
                    </TabsContent>
                    </Tabs>
                  </div>

                  <Card className="h-fit sticky top-24 border-none shadow-lg overflow-hidden flex flex-col">
                    <CardHeader className="bg-primary text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Purchase Cart
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableBody>
                            {purchaseCart.map(item => (
                              <TableRow key={item.medicineId}>
                                <TableCell className="text-sm font-medium">{item.name}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="icon-xs" 
                                      className="h-6 w-6 rounded-full"
                                      onClick={() => updatePurchaseQuantity(item.medicineId, item.quantity - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input 
                                      type="number" 
                                      className="w-12 h-7 text-center text-sm font-bold p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      value={item.quantity}
                                      onChange={(e) => updatePurchaseQuantity(item.medicineId, parseInt(e.target.value) || 0)}
                                    />
                                    <Button 
                                      variant="outline" 
                                      size="icon-xs" 
                                      className="h-6 w-6 rounded-full"
                                      onClick={() => updatePurchaseQuantity(item.medicineId, item.quantity + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-bold">${item.subtotal.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            {purchaseCart.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                                  Cart is empty
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                    <div className="p-6 border-t bg-muted/30 space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Supplier Name</Label>
                        <Input 
                          placeholder="Enter supplier..." 
                          className="h-9"
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Cost</span>
                        <span>${totalPurchaseAmount.toFixed(2)}</span>
                      </div>
                      <Button className="w-full h-12 text-lg" disabled={purchaseCart.length === 0} onClick={handlePurchaseCheckout}>
                        Record Purchase
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-3xl font-bold">Inventory</h2>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search inventory..." 
                          className="pl-10" 
                          value={inventorySearchQuery} 
                          onChange={(e) => setInventorySearchQuery(e.target.value)} 
                        />
                      </div>
                      <Select value={inventoryFilter} onValueChange={(v: any) => setInventoryFilter(v)}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Items</SelectItem>
                          <SelectItem value="low">Low Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
                        <DialogTrigger render={<Button onClick={() => setIsAddMedicineOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Medicine</Button>} />
                        <DialogContent>
                          <DialogHeader><DialogTitle>New Medicine</DialogTitle></DialogHeader>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const success = await addMedicine(Object.fromEntries(formData));
                            if (success) setIsAddMedicineOpen(false);
                          }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Name</Label>
                                <Input name="name" placeholder="Medicine Name" required />
                              </div>
                              <div className="space-y-2">
                                <Label>Generic Name</Label>
                                <Input name="genericName" placeholder="Generic Name" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Barcode</Label>
                                <Input name="barcode" placeholder="Scan or enter barcode" />
                              </div>
                              <div className="space-y-2">
                                <Label>Category</Label>
                                <Select name="category" defaultValue="General">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="General">General</SelectItem>
                                    <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                                    <SelectItem value="Painkillers">Painkillers</SelectItem>
                                    <SelectItem value="Vitamins">Vitamins</SelectItem>
                                    <SelectItem value="Syrup">Syrup</SelectItem>
                                    <SelectItem value="Tablets">Tablets</SelectItem>
                                    <SelectItem value="Injections">Injections</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Manufacturer</Label>
                                <Input name="manufacturer" placeholder="Manufacturer" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Stock</Label>
                                <Input name="stock" type="number" placeholder="Stock" required />
                              </div>
                              <div className="space-y-2">
                                <Label>Low Stock Threshold</Label>
                                <Input name="lowStockThreshold" type="number" defaultValue={10} required />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Cost Price</Label>
                                <Input name="cost" type="number" step="0.01" placeholder="Cost" required />
                              </div>
                              <div className="space-y-2">
                                <Label>Selling Price</Label>
                                <Input name="price" type="number" step="0.01" placeholder="Price" required />
                              </div>
                            </div>
                            <Button type="submit" className="w-full">Save Medicine</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <Card className="p-0 border-none shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {medicines
                          .filter(m => {
                            const matchesSearch = m.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || 
                                                m.genericName?.toLowerCase().includes(inventorySearchQuery.toLowerCase());
                            const matchesFilter = inventoryFilter === 'all' || m.stock <= (m.lowStockThreshold || 10);
                            return matchesSearch && matchesFilter;
                          })
                          .map(med => (
                          <TableRow key={med.id}>
                            <TableCell>
                              <div className="font-medium">{med.name}</div>
                              <div className="text-xs text-muted-foreground">{med.genericName}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal">{med.category || 'General'}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end">
                                <span className={med.stock <= (med.lowStockThreshold || 10) ? 'text-red-600 font-bold' : ''}>
                                  {med.stock}
                                </span>
                                {med.stock <= (med.lowStockThreshold || 10) && (
                                  <span className="text-[10px] text-red-500 uppercase font-bold">Low Stock</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">${med.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Dialog open={!!editingMedicine && editingMedicine.id === med.id} onOpenChange={(open) => !open && setEditingMedicine(null)}>
                                <DialogTrigger render={
                                  <Button variant="ghost" size="icon" className="text-blue-600" onClick={() => setEditingMedicine(med)}>
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                } />
                                <DialogContent key={med.id}>
                                  <DialogHeader><DialogTitle>Edit Medicine</DialogTitle></DialogHeader>
                                  <form 
                                    key={med.id}
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const formData = new FormData(e.currentTarget);
                                      updateMedicine(med.id, Object.fromEntries(formData));
                                    }} 
                                    className="space-y-4"
                                  >
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input name="name" defaultValue={med.name || ""} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Generic Name</Label>
                                        <Input name="genericName" defaultValue={med.genericName || ""} />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select name="category" defaultValue={med.category || "General"}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="General">General</SelectItem>
                                            <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                                            <SelectItem value="Painkillers">Painkillers</SelectItem>
                                            <SelectItem value="Vitamins">Vitamins</SelectItem>
                                            <SelectItem value="Syrup">Syrup</SelectItem>
                                            <SelectItem value="Tablets">Tablets</SelectItem>
                                            <SelectItem value="Injections">Injections</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Manufacturer</Label>
                                        <Input name="manufacturer" defaultValue={med.manufacturer || ""} placeholder="Manufacturer" />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Stock</Label>
                                        <Input name="stock" type="number" defaultValue={med.stock ?? 0} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Low Stock Threshold</Label>
                                        <Input name="lowStockThreshold" type="number" defaultValue={med.lowStockThreshold ?? 10} required />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Cost Price</Label>
                                        <Input name="cost" type="number" step="0.01" defaultValue={med.cost ?? 0} required />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Selling Price</Label>
                                        <Input name="price" type="number" step="0.01" defaultValue={med.price ?? 0} required />
                                      </div>
                                    </div>
                                    <Button type="submit" className="w-full">Update Medicine</Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button variant="ghost" size="icon" className="text-red-600" onClick={() => deleteMedicine(med.id)}><Trash2 className="w-4 h-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-3xl font-bold">Sales History</h2>
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Date</Label>
                        <Input 
                          type="date" 
                          className="h-9 w-40" 
                          value={salesFilterDate} 
                          onChange={(e) => setSalesFilterDate(e.target.value)} 
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Payment</Label>
                        <Select value={salesFilterPayment} onValueChange={setSalesFilterPayment}>
                          <SelectTrigger className="h-9 w-32">
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Methods</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="Mobile">Mobile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-xs">Seller</Label>
                        <Select value={salesFilterSeller} onValueChange={setSalesFilterSeller}>
                          <SelectTrigger className="h-9 w-40">
                            <SelectValue placeholder="Seller" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Sellers</SelectItem>
                            {users.map(u => (
                              <SelectItem key={u.uid} value={u.uid}>{u.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1 pt-5">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSalesFilterDate('');
                            setSalesFilterPayment('All');
                            setSalesFilterSeller('All');
                          }}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Card className="p-0 border-none shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Seller</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Print</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sales
                            .filter(sale => {
                              const dateMatch = !salesFilterDate || (sale.timestamp && format(sale.timestamp.toDate(), 'yyyy-MM-dd') === salesFilterDate);
                              const paymentMatch = salesFilterPayment === 'All' || sale.paymentMethod === salesFilterPayment;
                              const sellerMatch = salesFilterSeller === 'All' || sale.sellerId === salesFilterSeller;
                              return dateMatch && paymentMatch && sellerMatch;
                            })
                            .map(sale => (
                            <TableRow key={sale.id}>
                              <TableCell>{sale.timestamp ? format(sale.timestamp.toDate(), 'MMM dd, HH:mm') : '...'}</TableCell>
                              <TableCell className="text-sm font-medium">
                                {users.find(u => u.uid === sale.sellerId)?.name || 'Unknown'}
                              </TableCell>
                              <TableCell>{sale.items.length} items</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-[10px] uppercase">{sale.paymentMethod}</Badge>
                              </TableCell>
                              <TableCell className="text-right font-bold">${sale.finalAmount.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => printInvoice(sale)}>
                                  <Printer className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="space-y-6">
                  {selectedCustomer ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                          <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                          <h2 className="text-3xl font-bold">{selectedCustomer.name}</h2>
                          <p className="text-muted-foreground">{selectedCustomer.phone}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                          <Badge className={`text-lg px-4 py-1 ${selectedCustomer.balance > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            Balance: ${selectedCustomer.balance?.toFixed(2) || '0.00'}
                          </Badge>
                          {selectedCustomer.balance > 0 && (
                            <Dialog open={isReceivePaymentOpen} onOpenChange={setIsReceivePaymentOpen}>
                              <DialogTrigger render={<Button variant="outline" size="sm" onClick={() => setIsReceivePaymentOpen(true)}>Receive Payment</Button>} />
                              <DialogContent>
                                <DialogHeader><DialogTitle>Receive Payment</DialogTitle></DialogHeader>
                                <form onSubmit={async (e) => {
                                  e.preventDefault();
                                  const amount = Number(new FormData(e.currentTarget).get('amount'));
                                  if (amount <= 0) return;
                                  try {
                                    const paymentData = {
                                      customerId: selectedCustomer.id,
                                      customerPhone: selectedCustomer.phone,
                                      amount: amount,
                                      timestamp: serverTimestamp(),
                                      method: 'Cash', // Default to cash for now
                                      note: 'Due clearing payment'
                                    };

                                    await addDoc(collection(db, 'customerPayments'), paymentData);
                                    
                                    await updateDoc(doc(db, 'customers', selectedCustomer.id), {
                                      balance: Math.max(0, selectedCustomer.balance - amount)
                                    });
                                    setPaymentSuccess({ amount, customerName: selectedCustomer.name });
                                    toast.success("Payment received successfully");
                                    setSelectedCustomer(prev => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));
                                    setIsReceivePaymentOpen(false);
                                  } catch (err) {
                                    handleFirestoreError(err, OperationType.UPDATE, 'customers');
                                  }
                                }} className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Payment Amount</Label>
                                    <Input name="amount" type="number" step="0.01" max={selectedCustomer.balance} placeholder={`Max $${selectedCustomer.balance.toFixed(2)}`} required />
                                  </div>
                                  <Button type="submit" className="w-full">Confirm Payment</Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 space-y-2">
                          <p className="text-sm text-muted-foreground">Total Purchases</p>
                          <p className="text-2xl font-bold">{sales.filter(s => s.customerPhone === selectedCustomer.phone).length}</p>
                        </Card>
                        <Card className="p-6 space-y-2">
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold">
                            ${sales.filter(s => s.customerPhone === selectedCustomer.phone)
                              .reduce((sum, s) => sum + s.finalAmount, 0).toFixed(2)}
                          </p>
                        </Card>
                        <Card className="p-6 space-y-2">
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="text-md font-medium">{selectedCustomer.address || 'No address provided'}</p>
                        </Card>
                      </div>

                      <Card className="border-none shadow-sm">
                        <CardHeader>
                          <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto">
                          <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Paid</TableHead>
                              <TableHead>Due</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sales
                              .filter(s => s.customerPhone === selectedCustomer.phone)
                              .map(sale => (
                                <TableRow key={sale.id}>
                                  <TableCell className="text-sm">
                                    {sale.timestamp ? format(sale.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : '...'}
                                  </TableCell>
                                  <TableCell>{sale.items.length} items</TableCell>
                                  <TableCell className="font-bold">${sale.finalAmount.toFixed(2)}</TableCell>
                                  <TableCell className="text-green-600 font-medium">${(sale.amountPaid || sale.finalAmount).toFixed(2)}</TableCell>
                                  <TableCell className={sale.dueAmount > 0 ? 'text-red-600 font-bold' : 'text-muted-foreground'}>
                                    ${(sale.dueAmount || 0).toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Dialog>
                                        <DialogTrigger render={
                                          <Button variant="ghost" size="icon">
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        } />
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Sale Details - {sale.id}</DialogTitle>
                                            <DialogDescription>
                                              {sale.timestamp ? format(sale.timestamp.toDate(), 'PPP p') : '...'}
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-4">
                                            <div className="overflow-x-auto">
                                              <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead>Item</TableHead>
                                                  <TableHead className="text-center">Qty</TableHead>
                                                  <TableHead className="text-right">Price</TableHead>
                                                  <TableHead className="text-right">Total</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {sale.items.map((item: any, idx: number) => (
                                                  <TableRow key={idx}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">${item.subtotal.toFixed(2)}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          </div>
                                          <div className="flex justify-between items-end border-t pt-4">
                                              <div className="text-sm space-y-1">
                                                <p><span className="text-muted-foreground">Payment Method:</span> {sale.paymentMethod}</p>
                                                <p><span className="text-muted-foreground">Seller:</span> {users.find(u => u.uid === sale.sellerId)?.name || 'Unknown'}</p>
                                              </div>
                                              <div className="text-right space-y-1">
                                                <p className="text-sm"><span className="text-muted-foreground">Subtotal:</span> ${sale.totalAmount.toFixed(2)}</p>
                                                <p className="text-sm"><span className="text-muted-foreground">Discount:</span> -${sale.discount.toFixed(2)}</p>
                                                <p className="text-xl font-bold text-primary">Total: ${sale.finalAmount.toFixed(2)}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button variant="outline" onClick={() => printInvoice(sale)}>
                                              <Printer className="w-4 h-4 mr-2" /> Print Invoice
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>
                                      <Button variant="ghost" size="icon" onClick={() => printInvoice(sale)}>
                                        <Printer className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            {sales.filter(s => s.customerPhone === selectedCustomer.phone).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                  No transactions found for this customer.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>

                      <Card className="border-none shadow-sm">
                        <CardHeader>
                          <CardTitle>Payment History (Due Clearing)</CardTitle>
                        </CardHeader>
                        <div className="overflow-x-auto">
                          <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Note</TableHead>
                              <TableHead className="text-right">Amount Received</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerPayments
                              .filter(p => p.customerPhone === selectedCustomer.phone)
                              .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
                              .map(payment => (
                                <TableRow key={payment.id}>
                                  <TableCell className="text-sm">
                                    {payment.timestamp ? format(payment.timestamp.toDate(), 'MMM dd, yyyy HH:mm') : '...'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-[10px] uppercase">{payment.method}</Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-xs">{payment.note}</TableCell>
                                  <TableCell className="text-right font-bold text-green-600">
                                    +${payment.amount.toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            {customerPayments.filter(p => p.customerPhone === selectedCustomer.phone).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                  No payment history found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-3xl font-bold">Customer Management</h2>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              placeholder="Search customers..." 
                              className="pl-10" 
                              value={customerSearchQuery} 
                              onChange={(e) => setCustomerSearchQuery(e.target.value)} 
                            />
                          </div>
                          <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
                            <DialogTrigger render={<Button onClick={() => setIsAddCustomerOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Customer</Button>} />
                            <DialogContent>
                              <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
                              <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                try {
                                  await addDoc(collection(db, 'customers'), {
                                    name: formData.get('name'),
                                    phone: formData.get('phone'),
                                    address: formData.get('address'),
                                    balance: 0,
                                    createdAt: serverTimestamp()
                                  });
                                  toast.success("Customer added");
                                  setIsAddCustomerOpen(false);
                                } catch (err) {
                                  handleFirestoreError(err, OperationType.CREATE, 'customers');
                                }
                              }} className="space-y-4">
                                <Input name="name" placeholder="Customer Name" required />
                                <Input name="phone" placeholder="Phone Number" required />
                                <Input name="address" placeholder="Address" />
                                <Button type="submit" className="w-full">Save Customer</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                      <Card className="p-0 border-none shadow-sm">
                        <div className="overflow-x-auto">
                          <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead className="text-right">Balance</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customers
                              .filter(c => 
                                c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                                c.phone.includes(customerSearchQuery)
                              )
                              .map(customer => (
                              <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCustomer(customer)}>
                                <TableCell className="font-medium">{customer.name}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell className={`text-right font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                  ${customer.balance?.toFixed(2) || '0.00'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="ghost" size="icon">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'adjustments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Stock Adjustments</h2>
                    <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
                      <DialogTrigger render={<Button onClick={() => setIsAdjustmentOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Adjustment</Button>} />
                      <DialogContent>
                        <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data = Object.fromEntries(formData);
                          const success = await adjustStock({ ...data, medicineId: adjMedicineId });
                          if (success) {
                            setAdjMedicineId("");
                            setIsAdjustmentOpen(false);
                          }
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Medicine</Label>
                            <Popover open={adjOpen} onOpenChange={setAdjOpen}>
                              <PopoverTrigger render={
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={adjOpen}
                                  className="w-full justify-between"
                                >
                                  {adjMedicineId
                                    ? medicines.find((m) => m.id === adjMedicineId)?.name
                                    : "Select medicine..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              } />
                              <PopoverContent className="w-[400px] p-0">
                                <Command>
                                  <CommandInput placeholder="Search medicine..." />
                                  <CommandList>
                                    <CommandEmpty>No medicine found.</CommandEmpty>
                                    <CommandGroup>
                                      {medicines.map((m) => (
                                        <CommandItem
                                          key={m.id}
                                          value={m.name}
                                          onSelect={() => {
                                            setAdjMedicineId(m.id);
                                            setAdjOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              adjMedicineId === m.id ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {m.name} (Stock: {m.stock})
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Type</Label>
                              <Select name="type" defaultValue="addition">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="addition">Addition (+)</SelectItem>
                                  <SelectItem value="subtraction">Subtraction (-)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              <Input name="quantity" type="number" min="1" required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input name="reason" placeholder="e.g., Damage, Correction, Return" required />
                          </div>
                          <Button type="submit" className="w-full">Confirm Adjustment</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Card className="p-0 border-none shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Medicine</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {stockAdjustments.map(adj => (
                          <TableRow key={adj.id}>
                            <TableCell className="text-sm">{adj.timestamp ? format(adj.timestamp.toDate(), 'MMM dd, HH:mm') : '...'}</TableCell>
                            <TableCell className="font-medium">{adj.medicineName}</TableCell>
                            <TableCell>
                              <Badge variant={adj.type === 'addition' ? 'default' : 'destructive'} className="text-[10px] uppercase">
                                {adj.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-bold">{adj.type === 'addition' ? '+' : '-'}{adj.quantity}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{adj.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'expenses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">Expenses</h2>
                    <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                      <DialogTrigger render={<Button onClick={() => setIsExpenseOpen(true)}><Plus className="w-4 h-4 mr-2" /> Record Expense</Button>} />
                      <DialogContent>
                        <DialogHeader><DialogTitle>New Expense</DialogTitle></DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const success = await addExpense(Object.fromEntries(formData));
                          if (success) setIsExpenseOpen(false);
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Select name="category" defaultValue="Utility">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Rent">Rent</SelectItem>
                                <SelectItem value="Utility">Utility</SelectItem>
                                <SelectItem value="Salary">Salary</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input name="amount" type="number" step="0.01" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Note</Label>
                            <Input name="note" placeholder="Description of expense" required />
                          </div>
                          <Button type="submit" className="w-full">Save Expense</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Card className="p-0 border-none shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                      <TableBody>
                        {expenses.map(exp => (
                          <TableRow key={exp.id}>
                            <TableCell className="text-sm">{exp.timestamp ? format(exp.timestamp.toDate(), 'MMM dd, HH:mm') : '...'}</TableCell>
                            <TableCell><Badge variant="outline">{exp.category}</Badge></TableCell>
                            <TableCell className="text-sm">{exp.note}</TableCell>
                            <TableCell className="text-right font-bold text-red-600">-${exp.amount.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'accounting' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Accounting</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-green-50 border-green-100">
                      <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold text-green-700">
                        ${sales.reduce((sum, s) => sum + s.finalAmount, 0).toFixed(2)}
                      </p>
                    </Card>
                    <Card className="p-6 bg-red-50 border-red-100">
                      <p className="text-sm text-red-600 font-medium">Total Expenses</p>
                      <p className="text-3xl font-bold text-red-700">
                        ${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                      </p>
                    </Card>
                    <Card className="p-6 bg-blue-50 border-blue-100">
                      <p className="text-sm text-blue-600 font-medium">Net Profit</p>
                      <p className="text-3xl font-bold text-blue-700">
                        ${(sales.reduce((sum, s) => sum + s.finalAmount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0)).toFixed(2)}
                      </p>
                    </Card>
                  </div>
                  <Card className="border-none shadow-sm">
                    <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
                    <div className="overflow-x-auto">
                      <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          ...sales.map(s => ({ ...s, type: 'Income', desc: `Sale #${s.id.slice(-4)}` })),
                          ...expenses.map(e => ({ ...e, type: 'Expense', desc: e.note, finalAmount: -e.amount }))
                        ]
                        .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
                        .slice(0, 20)
                        .map((t, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-sm">{t.timestamp ? format(t.timestamp.toDate(), 'MMM dd, HH:mm') : '...'}</TableCell>
                            <TableCell>
                              <Badge variant={t.type === 'Income' ? 'default' : 'destructive'} className="text-[10px] uppercase">
                                {t.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{t.desc}</TableCell>
                            <TableCell className={`text-right font-bold ${t.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'Income' ? '+' : ''}${t.finalAmount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'users' && profile?.role === 'admin' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold">User Management</h2>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger render={<Button onClick={() => setIsAddUserOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add New User</Button>} />
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Staff Member</DialogTitle>
                          <DialogDescription>Create a new account with email and password.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const email = formData.get('email') as string;
                          const password = formData.get('password') as string;
                          const name = formData.get('name') as string;
                          const role = formData.get('role') as 'manager' | 'staff';

                          try {
                            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                            const newUser = userCredential.user;

                            await setDoc(doc(db, 'users', newUser.uid), {
                              uid: newUser.uid,
                              email,
                              name,
                              role
                            });

                            await secondaryAuth.signOut();
                            toast.success("Staff member added successfully");
                            setIsAddUserOpen(false);
                          } catch (error: any) {
                            if (error.code === 'auth/operation-not-allowed') {
                              toast.error("Email/Password authentication is not enabled in your Firebase Console. Please enable it under Build > Authentication > Sign-in method.");
                            } else {
                              toast.error(error.message || "Failed to add staff");
                            }
                            console.error("Staff creation error:", error);
                          }
                        }} className="space-y-4">
                          <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input name="name" placeholder="John Doe" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Email Address</Label>
                            <Input name="email" type="email" placeholder="john@example.com" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <Input name="password" type="password" placeholder="Min 6 characters" required minLength={6} />
                          </div>
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select name="role" defaultValue="staff">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full">Create Account</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Card className="border-none shadow-sm">
                    <div className="overflow-x-auto">
                      <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u.uid}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {u.uid !== user?.uid && (
                                <Button variant="ghost" size="icon" className="text-red-600" onClick={async () => {
                                  if (confirm(`Are you sure you want to remove ${u.name}?`)) {
                                    try {
                                      await deleteDoc(doc(db, 'users', u.uid));
                                      toast.success("User removed");
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.DELETE, `users/${u.uid}`);
                                    }
                                  }
                                }}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'transfers' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Stock Transfers</h2>
                  <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <ArrowLeftRight className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Stock Transfer Feature</h3>
                      <p className="text-muted-foreground max-w-md">
                        This feature allows you to transfer stock between different pharmacy branches or warehouses. 
                        It is currently in development.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Notification Templates</h2>
                  <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Notification Templates</h3>
                      <p className="text-muted-foreground max-w-md">
                        Manage SMS and Email templates for low stock alerts, customer reminders, and invoices.
                        This feature is currently in development.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">Payment Accounts</h2>
                  <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <CreditCard className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Payment Accounts</h3>
                      <p className="text-muted-foreground max-w-md">
                        Manage your bank accounts, mobile banking (bKash, Nagad), and cash drawers.
                        This feature is currently in development.
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold">Reports</h2>
                  <Card className="p-6 border-none shadow-sm">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="sales" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'settings' && profile?.role === 'admin' && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-bold">Settings</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle>Staff Management</CardTitle>
                        <CardDescription>Add and manage your pharmacy staff accounts.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                          <DialogTrigger render={<Button className="w-full" onClick={() => setIsAddUserOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add New Staff</Button>} />
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Staff Member</DialogTitle>
                              <DialogDescription>Create a new account with email and password.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              const email = formData.get('email') as string;
                              const password = formData.get('password') as string;
                              const name = formData.get('name') as string;
                              const role = formData.get('role') as 'manager' | 'staff';

                              try {
                                // Create user in secondary auth to avoid logging out admin
                                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                                const newUser = userCredential.user;

                                await setDoc(doc(db, 'users', newUser.uid), {
                                  uid: newUser.uid,
                                  email,
                                  name,
                                  role
                                });

                                // Sign out from secondary app immediately
                                await secondaryAuth.signOut();
                                
                                toast.success("Staff member added successfully");
                                setIsAddUserOpen(false);
                              } catch (error: any) {
                                if (error.code === 'auth/operation-not-allowed') {
                                  toast.error("Email/Password authentication is not enabled in your Firebase Console. Please enable it under Build > Authentication > Sign-in method.");
                                } else {
                                  toast.error(error.message || "Failed to add staff");
                                }
                                console.error("Staff creation error:", error);
                              }
                            }} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input name="name" placeholder="John Doe" required />
                              </div>
                              <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input name="email" type="email" placeholder="john@example.com" required />
                              </div>
                              <div className="space-y-2">
                                <Label>Initial Password</Label>
                                <Input name="password" type="password" placeholder="••••••••" required minLength={6} />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Select name="role" defaultValue="staff">
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manager">Manager</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button type="submit" className="w-full">Create Account</Button>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <div className="border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.filter(u => u.uid !== user.uid).map(u => (
                                <TableRow key={u.uid}>
                                  <TableCell>
                                    <div className="font-medium">{u.name}</div>
                                    <div className="text-xs text-muted-foreground">{u.email}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">{u.role}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="text-destructive"
                                      onClick={async () => {
                                        if (confirm("Are you sure? This will only remove the user from the database. To fully delete, use Firebase Console.")) {
                                          try {
                                            await deleteDoc(doc(db, 'users', u.uid));
                                            toast.success("User removed from database");
                                          } catch (err) {
                                            toast.error("Failed to remove user");
                                          }
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            </Table>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm h-fit">
                      <CardHeader>
                        <CardTitle>Pharmacy Information</CardTitle>
                        <CardDescription>Update your pharmacy details for invoices.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form 
                          key={pharmacyInfo ? 'loaded' : 'loading'}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            savePharmacyInfo(Object.fromEntries(formData));
                          }} 
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <Label>Pharmacy Name</Label>
                            <Input name="name" defaultValue={pharmacyInfo?.name || "PharmaFlow"} required />
                          </div>
                          <div className="space-y-2">
                            <Label>Address</Label>
                            <Input name="address" defaultValue={pharmacyInfo?.address || ""} placeholder="123 Health St, Medical City" />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input name="phone" defaultValue={pharmacyInfo?.phone || ""} placeholder="+1 234 567 890" />
                          </div>
                          <div className="space-y-2">
                            <Label>Email (Optional)</Label>
                            <Input name="email" type="email" defaultValue={pharmacyInfo?.email || ""} placeholder="contact@pharmaflow.com" />
                          </div>
                          <Button type="submit" className="w-full">Save Changes</Button>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        {isScannerOpen && (
          <BarcodeScanner 
            onScan={handleBarcodeScan} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

