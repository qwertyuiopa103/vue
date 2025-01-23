<template>
    <div ref="orderCSV"></div>
  </template>
  
<script>
export default {
  methods: {
    exportOrdersToCSV(orders) {
      if (!orders || orders.length === 0) {
        console.error('沒有可匯出的訂單資料');
        return;
      }

      // 修正金額計算：確保每個 totalPrice 是數值
      const totalRevenue = orders.reduce((sum, order) => {
        const price = parseFloat(order.totalPrice) || 0; // 確保非數值自動設為 0
        return sum + price;
      }, 0);

      // 計算統計資訊
      const totalOrders = orders.length;
      const monthlyStats = this.calculateMonthlyStats(orders);
      const highestOrderMonth = this.findHighestOrderMonth(monthlyStats);

      // 統計資訊字串
      const statsInfo = [
        `總訂單數,${totalOrders}`,
        `平均每月訂單,${monthlyStats.averageOrdersPerMonth.toFixed(2)}`,
        `最高訂單月份,${highestOrderMonth.month}`,
        `總營業額,NT$${totalRevenue.toLocaleString()}`
      ];

      const headers = [
        '訂單編號', '使用者ID', '照護人員編號', 
        '訂單日期', '開始日期', '結束日期', 
        '狀態', '付款方式', '總金額'
      ];

      // 組合 CSV 內容
      let csvContent = statsInfo.join('\n') + '\n\n';
      csvContent += headers.join(',') + '\n';

      const csvData = orders.map(order => [
        order.orderId || '',
        order.userID || '',
        order.caregiverNO || '',
        order.orderDate || '',
        order.startDate || '',
        order.endDate || '',
        order.status || '',
        order.paymentMethod || '',
        parseFloat(order.totalPrice) || 0 // 確保金額正確
      ]);

      csvData.forEach(row => {
        csvContent += row.join(',') + '\n';
      });

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', '訂單匯出_' + new Date().toISOString().split('T')[0] + '.csv');
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    calculateMonthlyStats(orders) {
      const monthlyOrders = {};
      orders.forEach(order => {
        const month = order.orderDate.slice(0, 7); // 取年月
        monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
      });

      const months = Object.keys(monthlyOrders);
      const averageOrdersPerMonth = months.length > 0 
        ? Object.values(monthlyOrders).reduce((a, b) => a + b, 0) / months.length 
        : 0;

      return { monthlyOrders, averageOrdersPerMonth };
    },

    findHighestOrderMonth(monthlyStats) {
      const { monthlyOrders } = monthlyStats;
      const highestOrderMonth = Object.entries(monthlyOrders).reduce(
        (max, [month, count]) => count > max.count ? { month, count } : max, 
        { month: '', count: 0 }
      );

      return highestOrderMonth;
    }
  }
}
</script>

