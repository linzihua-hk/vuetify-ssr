const fs = require('fs');
const path = require('path');
const vsr = require('vue-server-renderer');
const Vue = require('vue');

const renderer = vsr.createRenderer({
    template: fs.readFileSync(path.join(__dirname, '../template.html'), 'utf-8'),
});
const TemplateStart = '<template>';
const TemplateEnd = '</template>';

/**
 * { title: String, keywords: String, description: String }
 * @param title 默认标题
 * @param keywords 默认关键字
 * @param description 默认描述
 */
function VuetifyRenderer(options) {
    this.title = 'Vuetify SSR'
    this.keywords = '';
    this.description = '';
    if (options.title) this.title = options.title;
    if (options.keywords) this.keywords = options.keywords;
    if (options.description) this.description = options.description;
}

VuetifyRenderer.prototype = {
    /**
     * @param res
     * @param viewName
     * @param context `{ vue: Object, vuetify: Object, html: Object }`
     */
    renderToString: async function (res, viewName, context) {
        try {
            if (!context) context = {};
            if (!context.vue) context.vue = {};
            if (!context.vuetify) context.vuetify = {};
            if (!context.html) context.html = {};
            if (!context.html.title) context.html.title = this.title;
            if (!context.html.keywords) context.html.keywords = this.keywords;
            if (!context.html.description) context.html.description = this.description;
            context.html.data = Buffer.from(encodeURIComponent(JSON.stringify(context.vuetify))).toString('base64');
            let template = await this.loadTemplate(viewName);
            let replaces = [];
            let matches = template.match(/<[^/\s]+\s+vuetify[\s>]/g);
            if (matches) {
                for (let match of matches) {
                    let tagName = match.match(/<([^/\s]+)\s+vuetify[\s>]/)[1];
                    let tagNameStart = `<${tagName}`;
                    let tagNameEnd = `</${tagName}>`;
                    let startIndex = template.indexOf(match);
                    if (startIndex == -1) continue;
                    let offset = startIndex;
                    let endIndex = -1;
                    while (true) {
                        endIndex = template.indexOf(tagNameEnd, offset);
                        if (endIndex == -1) break;
                        let otherStart = template.indexOf(tagNameStart + ' ', offset + 1);
                        if (otherStart == -1) otherStart = template.indexOf(tagNameStart + '>', offset + 1);
                        if (otherStart == -1) break;
                        offset = endIndex + 1;
                    }
                    if (endIndex == -1) continue;
                    let vuetifyTag = template.slice(startIndex, endIndex + tagNameEnd.length);
                    let replaceTag = `<vuetify>${Math.random().toFixed(10).substr(2)}</vuetify>`;
                    template = template.replace(vuetifyTag, replaceTag);
                    let newStart = match.replace('vuetify', '');
                    vuetifyTag = vuetifyTag.replace(match, newStart);
                    replaces.push({ replaceTag, vuetifyTag });
                }
            }
            let vue = new Vue({
                data: context.vue,
                template,
            });
            let html = await renderer.renderToString(vue, context.html);
            for (let replace of replaces) {
                html = html.replace(replace.replaceTag, replace.vuetifyTag);
            }
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
        let matches = tags.match(/<!--template:[^-]+-->/g);
        if (matches) {
            for (let match of matches) {
                let templateName = match.match(/<!--template:([^-]+)-->/);
                if (templateName) {
                    let temlpate = await this.loadTemplate(templateName[1]);
                    tags = tags.replace(match, temlpate);
                }
            }
        }
        return tags;
    }
}

module.exports = {
    VuetifyRenderer,
    /**
     * { title: String, keywords: String, description: String }
     * @param title 默认标题
     * @param keywords 默认关键字
     * @param description 默认描述
     */
    createRenderer: function (options) {
        return new VuetifyRenderer(options);
    }
}
