<template>
  <v-app>
    <!--template:Tabs-->
    <v-main>
      <v-container>
        <v-card>
          <v-card-title>访问详情</v-card-title>
          <v-card-text>
            <div>{{ `当前访问地址：${url}` }}</div>
            <div>{{ `已访问次数：${count}` }}</div>
          </v-card-text>
          <v-card-text>
            <v-form method="POST">
              <v-text-field label="参数1" name="p1" :value="p1"></v-text-field>
              <v-text-field label="参数1" name="p2" :value="p2"></v-text-field>
              <v-btn type="submit">提交</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>
