(function() {
    Vue.component("modal", {
        template: "#modal-template",
        props: ["image_id"],
        data: function() {
            return {
                url: "",
                username: "",
                title: "",
                description: "",
                uploadTime: "",
                comments: [],
                comment: {
                    text: "",
                    name: ""
                }
            };
        },
        mounted: function() {
            const self = this;
            console.log("self.image_id: ", self.image_id);
            axios
                .get("/image/" + self.image_id)
                .then(function(results) {
                    // console.log("results ", results);
                    self.url = results.data[0].url;
                    self.title = results.data[0].title;
                    self.description = results.data[0].description;
                    self.username = results.data[0].username;
                    self.uploadTime = results.data[0].created_at.slice(0, 10);
                })
                .then(function() {
                    axios
                        .get("/image/" + self.image_id + "/comments")
                        .then(function(results) {
                            console.log("comments results: ", results);
                            if (results.data.length > 0) {
                                for (let i = 0; i < results.data.length; i++) {
                                    self.comments.unshift(results.data[i]);
                                    console.log(
                                        "results.data[i]: ",
                                        results.data[i]
                                    );
                                }
                            }
                        });
                });
        }, //closes mounted
        methods: {
            addImageComment: function(e) {
                e.preventDefault();
                var self = this;
                axios
                    .post("/comment/" + self.image_id + "/add", {
                        text: self.comment.text,
                        name: self.comment.name
                    })
                    .then(function(results) {
                        console.log("results from add comment: ", results);
                        self.comments.unshift(results.data[0]);
                        self.comment.text = "";
                        self.comment.name = "";
                    });
            }
        }
    });
})();

// calling constructor and getting instance(object representing our app)
new Vue({
    el: "#main",
    //element with the id main
    data: {
        image_id: false,
        images: [],
        more: true,

        form: {
            title: "",
            name: "",
            description: "",
            file: null //as default value
        }
    },
    mounted: function() {
        const self = this; //because of a nested function then(), 'this' would lose it's purpose, that's why we need const self = this;
        axios.get("/images").then(function(response) {
            //.then runs when we get resposne from server
            //when there is something in the image array, v-for in html runs: loops and renders pictures.
            self.images = response.data; //why not response.data.images?
            if (self.images[self.images.length - 1].id == 1) {
                self.more = false;
            }
            // if == )
        });
    }, //mounted ends here

    methods: {
        //here only functions associated with main;
        uploadFile: function(e) {
            //znaci (event)
            const self = this;
            e.preventDefault();
            // console.log("this.form.title: ", this.form.title);
            var file = document.getElementById("file");
            console.log("file: ", file);
            var uploadedFile = file.files[0];
            console.log("uploadedFile: ", uploadedFile);

            //we want to send uploadedFile to the server
            //we have to use api called formData:
            var formData = new FormData();
            formData.append("file", uploadedFile); //this is adding object, with property 'file', and value uploadedFile
            formData.append("name", this.form.name);
            formData.append("title", this.form.title);
            formData.append("description", this.form.description);

            //sending formData to the server as part of the request
            axios.post("/upload", formData).then(function(data) {
                console.log("data: ", data);
                self.images.unshift(data.data);
            });

            console.log("formData: ", formData);
        },
        showModal: function(image_id) {
            console.log("image_id: ", image_id);
            this.image_id = image_id;
        },
        hideModal: function() {
            this.image_id = null;
        },
        seeMore: function() {
            axios
                .post("/more", {
                    lastId: this.images[this.images.length - 1].id
                })
                .then(
                    function(result) {
                        if (this.images[this.images.length - 1].id == 18) {
                            this.more = false;
                        }
                        this.images = this.images.concat(result.data.rows);
                    }.bind(this)
                );
            console.log(this.images);
        }
    } //end methods
});
