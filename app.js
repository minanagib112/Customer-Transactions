document.addEventListener("DOMContentLoaded", function () {
  const filterNameInput = document.getElementById("filterName");
  const filterAmountInput = document.getElementById("filterAmount");
  const transactionsTable = document
    .getElementById("transactionsTable")
    .getElementsByTagName("tbody")[0];
  const chartPopup = document.getElementById("chartPopup");
  const chartCanvas = document.getElementById("chart");
  const closePopupButton = document.getElementById("closePopup");
  const customerNameDiv = document.getElementById("customerName");
  const pagination = document.getElementById("pagination");

  let customers = [];
  let transactions = [];
  let filteredTransactions = [];
  let currentPage = 1;
  const itemsPerPage = 10;

  async function fetchData() {
    try {
      const customersResponse = await fetch(
        "https://my-json-server.typicode.com/minanagib112/Customer-Transactions/customers"
      );
      const transactionsResponse = await fetch(
        "https://my-json-server.typicode.com/minanagib112/Customer-Transactions/transactions"
      );

      if (!customersResponse.ok || !transactionsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      customers = await customersResponse.json();
      transactions = await transactionsResponse.json();
      filteredTransactions = transactions; // Initially, show all transactions

      console.log("Fetched Customers:", customers);
      console.log("Fetched Transactions:", transactions);

      displayData();
      setupPagination();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function displayData() {
    console.log("Displaying data...");
    transactionsTable.innerHTML = "";
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const transactionsToDisplay = filteredTransactions.slice(
      startIndex,
      endIndex
    );

    transactionsToDisplay.forEach((transaction) => {
      const customer = customers.find(
        (customer) => customer.id === transaction.customer_id
      );
      if (customer) {
        console.log(
          "Displaying transaction:",
          transaction,
          "for customer:",
          customer
        );
        const row = transactionsTable.insertRow();
        row.insertCell(0).textContent = customer.name;
        row.insertCell(1).textContent = transaction.date;
        row.insertCell(2).textContent = transaction.amount;

        row.addEventListener("click", () =>
          showChartPopup(customer.id, customer.name)
        );
      } else {
        console.log("Customer not found for transaction:", transaction);
      }
    });
  }

  function filterTransactions() {
    const nameFilter = filterNameInput.value.toLowerCase();
    const amountFilter = parseFloat(filterAmountInput.value);
    filteredTransactions = transactions.filter((transaction) => {
      const customer = customers.find(
        (customer) => customer.id === transaction.customer_id
      );
      return (
        customer &&
        (!nameFilter || customer.name.toLowerCase().includes(nameFilter)) &&
        (!amountFilter || transaction.amount === amountFilter)
      );
    });
    currentPage = 1;
    displayData();
    setupPagination();
  }

  function showChartPopup(customerId, customerName) {
    console.log("Showing chart popup for customer:", customerId);
    customerNameDiv.textContent = customerName;
    chartPopup.style.display = "block";
    displayChart(customerId);
  }

  function hideChartPopup() {
    console.log("Hiding chart popup");
    chartPopup.style.display = "none";
  }

  closePopupButton.addEventListener("click", hideChartPopup);

  function displayChart(customerId) {
    const customerTransactions = transactions.filter(
      (t) => t.customer_id === customerId
    );
    const dates = [...new Set(customerTransactions.map((t) => t.date))];
    const amounts = dates.map((date) => {
      return customerTransactions
        .filter((t) => t.date === date)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const ctx = chartCanvas.getContext("2d");
    if (window.chartInstance) {
      window.chartInstance.destroy();
    }
    window.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Total Transaction Amount",
            data: amounts,
            borderColor: "#f00",
            borderWidth: 3,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  function setupPagination() {
    pagination.innerHTML = "";
    const pageCount = Math.ceil(filteredTransactions.length / itemsPerPage);
    for (let i = 1; i <= pageCount; i++) {
      const li = document.createElement("li");
      li.classList.add("page-item");
      if (i === currentPage) {
        li.classList.add("active");
      }
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", function (event) {
        event.preventDefault();
        currentPage = i;
        displayData();
        setupPagination();
      });
      pagination.appendChild(li);
    }
  }

  filterNameInput.addEventListener("input", filterTransactions);
  filterAmountInput.addEventListener("input", filterTransactions);

  // Initialize
  fetchData();
});
