const {
	createApp
} = Vue

const createGUID = () => {
	return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}

const App = {
	created() {
		if (this.passphrase.length) {
			if (!this.loadData()) this.showingPass = true
		} else {
			this.showingPass = true
		}
	},
	data() {
		return {
			passphrase: localStorage.getItem("p") || "",
			showingPass: false,
			showingEditor: false,
			passForm: {
				showSuccess: false,
				showError: false
			},
			billForm: {
				id: "",
				name: "",
				due: ""
			},
			data: {
				bills: []
			}
		}
	},
	methods: {
		saveData: function () {
			localStorage.setItem('data', CryptoJS.AES.encrypt(JSON.stringify(this.data), this.passphrase).toString())
		},
		loadData: function () {
			try {
				obj = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(localStorage.getItem('data'), this.passphrase)))
				this.data = obj
				return true
			} catch (e) {
				return false
			}
		},
		setPass: function () {
			// try to load data
			let obj = {
				bills: []
			}

			this.passForm.showSuccess = false
			this.passForm.showError = false

			try {

				if("data" in localStorage) obj = JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(localStorage.getItem('data'), this.passphrase)))

				this.data = obj
				this.passForm.showSuccess = true
				window.setTimeout(() => {
					this.showingPass = false
					localStorage.setItem('p', this.passphrase)
				}, 750)
			} catch (e) {
				console.dir(e)
				this.passForm.showError = true
			}
		},
		clearPass: function () {
			this.passphrase = ""
			localStorage.setItem("p", "")
			this.data = {
				bills: []
			}
		},
		upsertBill: function () {
			if(!this.billForm.id.length){
				this.billForm.id = createGUID()
				this.data.bills.push(this.billForm)
				this.saveData()
			}
			else{
				let ndx = this.data.bills.findIndex((bill) => {
					return bill.id == this.billForm.id
				})

				for(key in this.billForm) this.data.bills[ndx][key] = this.billForm[key]
				this.saveData()
			}
			this.showingEditor = false

		},
		loadBill: function (index) {
			this.billForm.id = this.data.bills[index].id
			this.billForm.name = this.data.bills[index].name
			this.billForm.due = this.data.bills[index].due
			this.showingEditor = true
		},
		newBill: function () {
			this.billForm.id = ""
			this.billForm.name = ""
			this.billForm.due = ""
			this.showingEditor = true
		}
	},
	computed: {
		passClass() {
			if (this.passForm.showError) {
				return 'form-control w-25 m-1 border-danger'
			} else if (this.passForm.showSuccess) {
				return 'form-control w-25 m-1 border-success'
			} else {
				return 'form-control w-25 m-1'
			}
		}
	}
};

createApp(App).mount("#app");