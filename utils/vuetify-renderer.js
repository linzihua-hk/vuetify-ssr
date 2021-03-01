const fs = require('fs');
const path = require('path');
const vsr = require('vue-server-renderer');
const Vue = require('vue');

const renderer = vsr.createRenderer({
    template: fs.readFileSync(path.join(__dirname, '../template.html'), 'utf-8'),
});
const TemplateStart = '<template>';
const TemplateEnd = '</template>';

function VuetifyRenderer() { }

VuetifyRenderer.prototype = {
    renderer: async function (res, viewName, vueContext, pageContext) {
        try {
            if (!vueContext) vueContext = {};
            if (!pageContext) pageContext = {};
            if (!pageContext.title) pageContext.title = viewName;
            if (!pageContext.keywords) pageContext.keywords = '';
            if (!pageContext.description) pageContext.description = '';
            let vue = new Vue({
                data: vueContext,
                template: await this.loadTemplate(viewName),
            });
            let html = await renderer.renderToString(vue, pageContext);
            res.end(html);
        } catch (error) {
            res.writeHead(500);
            res.end(error.toString());
        }
    },
    loadTemplate: async function (viewName) {
        let data = await fs.promises.readFile(path.join(__dirname, '../views', viewName + '.vue'));
        let tags = data.toString();
        let startIndex = tags.indexOf(TemplateStart);
        let endIndex = tags.lastIndexOf(TemplateEnd);
        if (startIndex != -1 && endIndex > startIndex) {
            tags = tags.slice(startIndex + TemplateStart.length, endIndex);
        }
        return tags;
    }
}

module.exports = {
    VuetifyRenderer,
    createRenderer: function () {
        return new VuetifyRenderer();
    }
}
