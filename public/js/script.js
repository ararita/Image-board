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
            axios
                .get("/image/" + self.image_id)
                .then(function(results) {
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
                            if (results.data.length > 0) {
                                for (let i = 0; i < results.data.length; i++) {
                                    self.comments.unshift(results.data[i]);
                                }
                            }
                        });
                });
        },
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
                        self.comments.unshift(results.data[0]);
                        self.comment.text = "";
                        self.comment.name = "";
                    });
            }
        }
    });
})();

new Vue({
    el: "#main",
    data: {
        image_id: false,
        images: [],
        more: true,

        form: {
            title: "",
            name: "",
            description: "",
            file: null
        }
    },
    mounted: function() {
        const self = this;
        axios.get("/images").then(function(response) {
            self.images = response.data;
            if (self.images[self.images.length - 1].id == 1) {
                self.more = false;
            }
        });
    },

    methods: {
        uploadFile: function(e) {
            const self = this;
            e.preventDefault();
            var file = document.getElementById("file");
            var uploadedFile = file.files[0];
            var formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("name", this.form.name);
            formData.append("title", this.form.title);
            formData.append("description", this.form.description);
            axios.post("/upload", formData).then(function(data) {
                self.images.unshift(data.data);
            });
        },
        showModal: function(image_id) {
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
        }
    }
});
