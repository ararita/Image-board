(function() {
    // calling constructor and getting instance(object representing out app)
    new Vue({
        el: "#main",
        //element with the id main
        data: {
            images: [],
            form: {
                title: "",
                name: "",
                decription: "",
                file: null //as default value
            }
        },
        mounted: function() {
            const self = this; //baceuse of a nested function then(), this would lose it's purpose, that's why we need const self = this;
            axios.get("/images").then(function(response) {
                //.then runs when we get resposne from server
                //when there is something in the image array, v-for in html runs: loops and renders pictures.
                self.images = response.data; //why not response.data.images?
            });
        }, //mounted ends here
        methods: {
            uploadFile: function(e) {
                //znaci (event)
                e.preventDefault();
                // console.log("this.form.title: ", this.form.title);
                var file = document.getElementById("file");
                console.log("file: ", file);
                var uploadedFile = file.files[0];
                console.log("uploadedFilefile: ", uploadedFile);

                //we want to send uploadedFile to the server
                //we have to use api called form data:
                var formData = new FormData();
                formData.append("file", uploadedFile); //this is adding object, with property 'file', and value uploadedFile
                formData.append("name", this.form.name);
                formData.append("title", this.form.title);
                formData.append("description", this.form.description);

                //sending formData to the server as part of the request
                axios.post("/upload", formData).then(function() {});

                console.log("formData: ", formData);
            }
        } //end methods
    });
})();
