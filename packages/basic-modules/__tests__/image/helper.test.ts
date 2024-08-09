/**
 * @description image helper test
 * @author wangfupeng
 */

import { Editor, Transforms } from 'slate'
import { DomEditor } from '@wangeditor-next/core'
import createEditor from '../../../../tests/utils/create-editor'
import {
  insertImageNode,
  updateImageNode,
  isInsertImageMenuDisabled,
} from '../../src/modules/image/helper'

describe('image helper', () => {
  let editor: any
  let startLocation: any

  const src = 'https://github.com/cycleccc/wangEditor-next'
  const emptySrc = ''
  const inValidSrc = 'cycleccc/github.io/docs/'
  const alt = 'logo'
  const href = 'https://www.wangeditor.com/'

  // 自定义校验图片
  function customCheckImageFn(src: string, alt: string, url: string): boolean | undefined | string {
    if (!src) {
      return
    }
    if (src.indexOf('http') !== 0) {
      return '图片网址必须以 http/https 开头'
    }
    return true
  }

  const editorConfig = { MENU_CONF: {} }
  editorConfig.MENU_CONF['insertImage'] = {
    checkImage: customCheckImageFn,
  }

  beforeEach(() => {
    editor = createEditor({
      config: editorConfig,
    })
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('insert image node', async () => {
    editor.select(startLocation)
    await insertImageNode(editor, src, alt, href)
    await insertImageNode(editor, src, alt, href)
    await insertImageNode(editor, emptySrc, alt, href)
    await insertImageNode(editor, inValidSrc, alt, href)
    const images = editor.getElemsByTypePrefix('image')
    expect(images.length).toBe(2)
  })

  it('parse image src', async () => {
    const editorConfig = { MENU_CONF: {} }
    editorConfig.MENU_CONF['insertImage'] = {
      parseImageSrc: false,
    }
    const editor = createEditor({
      config: editorConfig,
    })
    editor.select(startLocation)
    await insertImageNode(editor, src, alt, href)
    const images = editor.getElemsByTypePrefix('image')
    expect(images.length).toBe(1)
  })

  it('update image node', async () => {
    editor.select(startLocation)

    const elem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }
    editor.insertNode(elem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })

    const newSrc = 'https://www.baidu.com/logo.png'
    const newAlt = 'baidu'
    const newHref = 'https://www.baidu.com/'
    await updateImageNode(editor, newSrc, newAlt, newHref, {}) // 更新图片信息

    const imageNode = DomEditor.getSelectedNodeByType(editor, 'image')
    expect(imageNode).not.toBeNull()
  })

  it('is menu disable', async () => {
    editor.deselect()
    expect(isInsertImageMenuDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    expect(isInsertImageMenuDisabled(editor)).toBeFalsy()

    editor.insertText('hello')
    editor.select([])
    expect(isInsertImageMenuDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    Transforms.setNodes(editor, { type: 'header1' })
    expect(isInsertImageMenuDisabled(editor)).toBeTruthy()
  })
})
